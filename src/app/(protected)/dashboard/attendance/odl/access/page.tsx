import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  ShieldX,
  UsersRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { OdlAccessTable } from "@/features/attendance/odl-access/components/odl-access-table";
import {
  getOdlAccessData,
  parseOdlAccessSearchParams,
} from "@/features/attendance/odl-access/server/odl-access-queries";
import type {
  OdlAccessFilterValue,
  OdlAccessFilters,
} from "@/features/attendance/odl-access/types/odl-access-types";

type OdlAccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const accessOptions: Array<{
  label: string;
  value: OdlAccessFilterValue;
}> = [
  {
    label: "All Employees",
    value: "ALL",
  },
  {
    label: "ODL Enabled",
    value: "ENABLED",
  },
  {
    label: "ODL Disabled",
    value: "DISABLED",
  },
];

function OdlAccessFiltersForm({ filters }: { filters: OdlAccessFilters }) {
  return (
    <section className="starland-card p-5">
      <form className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_auto_auto] lg:items-end">
        <div>
          <label
            htmlFor="q"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Search Employee
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
            Access
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

        <button type="submit" className="starland-btn starland-btn-primary">
          <Search className="h-4 w-4" aria-hidden="true" />
          Apply
        </button>

        <Link
          href="/dashboard/attendance/odl/access"
          className="starland-btn starland-btn-soft"
        >
          Reset
        </Link>
      </form>
    </section>
  );
}

export default async function OdlAccessPage({
  searchParams,
}: OdlAccessPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseOdlAccessSearchParams(resolvedSearchParams);
  const result = await getOdlAccessData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            ODL Access
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            ODL Access Manager
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Enable or disable ODL web attendance access by updating the existing
            Flexible employee flag. This is useful for ODL, online, distance,
            remote, or flexible teachers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/odl/eligibility"
            className="starland-btn starland-btn-primary"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Eligibility Check
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
            ODL / Flexible Attendance Control
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Employee Access Summary
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Use this page to quickly grant or remove ODL web attendance access.
            Submit still requires webcam selfie, GPS, and full address.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UsersRound className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Employees
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalEmployees}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              ODL Enabled
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.enabledOdlEmployees}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldX className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              ODL Disabled
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.disabledOdlEmployees}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Active ODL Enabled
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.activeEnabledOdlEmployees}
            </p>
          </article>
        </div>
      </section>

      <OdlAccessFiltersForm filters={result.filters} />

      <OdlAccessTable result={result} />
    </section>
  );
}