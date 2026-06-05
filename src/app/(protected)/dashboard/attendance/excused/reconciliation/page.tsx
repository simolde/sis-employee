import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  ClipboardEdit,
  RotateCcw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ExcusedReconciliationPanel } from "@/features/attendance/excused/reconciliation/components/excused-reconciliation-panel";
import { ExcusedReconciliationTable } from "@/features/attendance/excused/reconciliation/components/excused-reconciliation-table";
import {
  getExcusedReconciliationData,
  parseExcusedReconciliationSearchParams,
} from "@/features/attendance/excused/reconciliation/server/excused-reconciliation-queries";
import type {
  ExcusedReconciliationFilters,
  ExcusedReconciliationOption,
  ExcusedReconciliationOptions,
} from "@/features/attendance/excused/reconciliation/types/excused-reconciliation-types";

type ExcusedReconciliationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function OptionList({
  options,
}: {
  options: ExcusedReconciliationOption[];
}) {
  return (
    <>
      <option value="">All</option>

      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </>
  );
}

function ExcusedReconciliationFiltersForm({
  filters,
  options,
}: {
  filters: ExcusedReconciliationFilters;
  options: ExcusedReconciliationOptions;
}) {
  return (
    <section className="starland-card p-5">
      <form className="grid gap-4 xl:grid-cols-4">
        <div>
          <label
            htmlFor="dateFrom"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Date From
          </label>

          <input
            id="dateFrom"
            name="dateFrom"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateFrom}
          />
        </div>

        <div>
          <label
            htmlFor="dateTo"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Date To
          </label>

          <input
            id="dateTo"
            name="dateTo"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateTo}
          />
        </div>

        <div className="xl:col-span-2">
          <label
            htmlFor="q"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Search
          </label>

          <input
            id="q"
            name="q"
            className="starland-input mt-2"
            placeholder="Employee, branch, department, or schedule"
            defaultValue={filters.q}
          />
        </div>

        <div>
          <label
            htmlFor="branchId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Branch
          </label>

          <select
            id="branchId"
            name="branchId"
            className="starland-input mt-2"
            defaultValue={filters.branchId}
          >
            <OptionList options={options.branches} />
          </select>
        </div>

        <div>
          <label
            htmlFor="departmentId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Department
          </label>

          <select
            id="departmentId"
            name="departmentId"
            className="starland-input mt-2"
            defaultValue={filters.departmentId}
          >
            <OptionList options={options.departments} />
          </select>
        </div>

        <div className="xl:col-span-2">
          <label
            htmlFor="scheduleId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Schedule
          </label>

          <select
            id="scheduleId"
            name="scheduleId"
            className="starland-input mt-2"
            defaultValue={filters.scheduleId}
          >
            <OptionList options={options.schedules} />
          </select>
        </div>

        <div className="flex items-end gap-2 xl:col-span-4">
          <button
            type="submit"
            className="starland-btn starland-btn-primary"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Scan EXCUSED Records
          </button>

          <Link
            href="/dashboard/attendance/excused/reconciliation"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function ExcusedReconciliationPage({
  searchParams,
}: ExcusedReconciliationPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseExcusedReconciliationSearchParams(
    resolvedSearchParams,
  );
  const result = await getExcusedReconciliationData(filters);
  const rollbackLimit = 200;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-warning">
            EXCUSED Reconciliation
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Reconcile Automatic EXCUSED Records
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Find automatic EXCUSED records that are no longer supported by
            approved leave, then safely rollback only records with verified
            generation provenance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/excused"
            className="starland-btn starland-btn-primary"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            EXCUSED Records
          </Link>

          <Link
            href="/dashboard/leaves"
            className="starland-btn starland-btn-soft"
          >
            <ClipboardEdit className="h-4 w-4" aria-hidden="true" />
            Leave Management
          </Link>

          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Attendance Actions
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Protected Reconciliation
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Approved Leave and Provenance Validation
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            The system scans automatic EXCUSED records, verifies whether
            approved leave still covers each attendance date, and requires the
            original automatic-generation activity log before rollback.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Automatic Checked
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.automaticExcusedChecked}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <RotateCcw className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Rollback Eligible
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.rollbackEligible}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Protected by Leave
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.protectedByApprovedLeave}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldAlert className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual Investigation
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.missingGenerationProvenance}
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldAlert className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual EXCUSED Protected
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.manualExcusedProtected}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldAlert className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Punched EXCUSED Protected
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.punchedExcusedProtected}
            </p>
          </article>
        </div>
      </section>

      <ExcusedReconciliationFiltersForm
        filters={result.filters}
        options={result.options}
      />

      <ExcusedReconciliationPanel
        result={result}
        limit={rollbackLimit}
      />

      <ExcusedReconciliationTable result={result} />
    </section>
  );
}