import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  FileClock,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ExcusedAuditActions } from "@/features/attendance/excused/audit/components/excused-audit-actions";
import { ExcusedAuditTable } from "@/features/attendance/excused/audit/components/excused-audit-table";
import {
  getExcusedAutomationAuditData,
  parseExcusedAutomationAuditSearchParams,
} from "@/features/attendance/excused/audit/server/excused-audit-queries";
import type { ExcusedAutomationAuditFilters } from "@/features/attendance/excused/audit/types/excused-audit-types";

type ExcusedAuditPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

function ExcusedAuditFiltersForm({
  filters,
}: {
  filters: ExcusedAutomationAuditFilters;
}) {
  return (
    <section className="starland-card p-5 print:hidden">
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

        <div>
          <label
            htmlFor="action"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Action
          </label>

          <select
            id="action"
            name="action"
            className="starland-input mt-2"
            defaultValue={filters.action}
          >
            <option value="">All actions</option>

            <option value="ATTENDANCE_EXCUSED_AUTO_GENERATED">
              EXCUSED generated
            </option>

            <option value="ATTENDANCE_EXCUSED_AUTO_ROLLED_BACK">
              EXCUSED rolled back
            </option>
          </select>
        </div>

        <div>
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
            placeholder="Attendance ID, actor user ID, or action"
            defaultValue={filters.q}
          />
        </div>

        <div className="flex items-end gap-2 xl:col-span-4">
          <button
            type="submit"
            className="starland-btn starland-btn-primary"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Apply Filters
          </button>

          <Link
            href="/dashboard/attendance/excused/audit"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function ExcusedAuditPage({
  searchParams,
}: ExcusedAuditPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;

  const filters =
    parseExcusedAutomationAuditSearchParams(
      resolvedSearchParams,
    );

  const result =
    await getExcusedAutomationAuditData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            EXCUSED Automation Audit
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            EXCUSED Generation and Rollback Logs
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review automatic EXCUSED generation and reconciliation
            rollback activity with complete old and new audit values.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <ExcusedAuditActions result={result} />

          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
            Attendance Actions
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Automation Traceability
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Approved-Leave EXCUSED Audit History
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Each generated EXCUSED record and every safe rollback is
            recorded with its actor, attendance entity, previous value,
            resulting value, and timestamp.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <FileClock className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Automation Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalAutomationLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Search className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.matchingLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Generated Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.generatedLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <RotateCcw className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Rollback Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.rollbackLogs}
            </p>
          </article>
        </div>

        <div className="border-t border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-start gap-3">
            <RefreshCw
              className="mt-0.5 h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <p className="text-sm leading-6 text-[var(--starland-muted-text)]">
              A rollback log remains available even after the related
              EXCUSED attendance record has been deleted.
            </p>
          </div>
        </div>
      </section>

      <ExcusedAuditFiltersForm
        filters={result.filters}
      />

      <ExcusedAuditTable result={result} />
    </section>
  );
}