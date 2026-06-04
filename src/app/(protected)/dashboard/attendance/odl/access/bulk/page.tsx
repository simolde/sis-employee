import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  ShieldX,
  UsersRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { OdlAccessBulkActionPanel } from "@/features/attendance/odl-access-bulk/components/odl-access-bulk-action-panel";
import {
  getOdlAccessBulkOptions,
  getOdlAccessBulkPreview,
  parseOdlAccessBulkFilters,
} from "@/features/attendance/odl-access-bulk/server/odl-access-bulk-queries";
import type {
  OdlAccessBulkAccessFilter,
  OdlAccessBulkFilters,
  OdlAccessBulkOption,
  OdlAccessBulkOptions,
} from "@/features/attendance/odl-access-bulk/types/odl-access-bulk-types";

type OdlAccessBulkPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const accessOptions: Array<{
  label: string;
  value: OdlAccessBulkAccessFilter;
}> = [
  {
    label: "All Access States",
    value: "ALL",
  },
  {
    label: "Currently Enabled",
    value: "ENABLED",
  },
  {
    label: "Currently Disabled",
    value: "DISABLED",
  },
];

function OptionList({
  options,
}: {
  options: OdlAccessBulkOption[];
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

function OdlAccessBulkFiltersForm({
  filters,
  options,
}: {
  filters: OdlAccessBulkFilters;
  options: OdlAccessBulkOptions;
}) {
  return (
    <section className="starland-card p-5">
      <form className="grid gap-4 xl:grid-cols-4">
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
            placeholder="Employee number, name, department, designation, schedule"
            defaultValue={filters.q}
          />
        </div>

        <div>
          <label
            htmlFor="access"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Current Access
          </label>

          <select
            id="access"
            name="access"
            className="starland-input mt-2"
            defaultValue={filters.access}
          >
            {accessOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="activeOnly"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Employee Status
          </label>

          <select
            id="activeOnly"
            name="activeOnly"
            className="starland-input mt-2"
            defaultValue={filters.activeOnly ? "true" : "false"}
          >
            <option value="true">Active only</option>
            <option value="false">All statuses</option>
          </select>
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

        <div>
          <label
            htmlFor="designationId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Designation
          </label>

          <select
            id="designationId"
            name="designationId"
            className="starland-input mt-2"
            defaultValue={filters.designationId}
          >
            <OptionList options={options.designations} />
          </select>
        </div>

        <div>
          <label
            htmlFor="empTypeId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Employee Type
          </label>

          <select
            id="empTypeId"
            name="empTypeId"
            className="starland-input mt-2"
            defaultValue={filters.empTypeId}
          >
            <OptionList options={options.employeeTypes} />
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

        <div className="flex items-end gap-2 xl:col-span-2">
          <button type="submit" className="starland-btn starland-btn-primary">
            <Search className="h-4 w-4" aria-hidden="true" />
            Preview Matching Employees
          </button>

          <Link
            href="/dashboard/attendance/odl/access/bulk"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function OdlAccessBulkPage({
  searchParams,
}: OdlAccessBulkPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseOdlAccessBulkFilters(resolvedSearchParams);

  const [options, preview] = await Promise.all([
    getOdlAccessBulkOptions(),
    getOdlAccessBulkPreview(filters),
  ]);

  const limit = 500;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Bulk ODL Access
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Bulk ODL Access Manager
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Enable or disable ODL/Flexible web attendance access in batches
            using employee profile filters. This prevents HR from updating
            employees one by one.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/odl/access"
            className="starland-btn starland-btn-primary"
          >
            <UsersRound className="h-4 w-4" aria-hidden="true" />
            Access Manager
          </Link>

          <Link
            href="/dashboard/attendance/odl"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to ODL
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Preview Before Applying
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Matching Employees Summary
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Review the counts first, then enable or disable ODL access for the
            matching employees. Every changed employee gets an activity log.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UsersRound className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Employees
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.matchingEmployees}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Currently Enabled
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.matchingEnabled}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldX className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Currently Disabled
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.matchingDisabled}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Active Matching
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.activeMatchingEmployees}
            </p>
          </article>
        </div>
      </section>

      <OdlAccessBulkFiltersForm filters={filters} options={options} />

      <OdlAccessBulkActionPanel
        filters={filters}
        preview={preview}
        limit={limit}
      />
    </section>
  );
}