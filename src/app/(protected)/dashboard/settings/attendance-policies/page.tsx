import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Database,
  ShieldCheck,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendancePolicyForm } from "@/features/settings/attendance-policies/components/attendance-policy-form";
import { getAttendancePolicySettingsPageData } from "@/features/settings/attendance-policies/server/attendance-policy-queries";

export const dynamic =
  "force-dynamic";

type AttendancePoliciesPageProps = {
  searchParams: Promise<{
    notice?:
      | string
      | string[];
  }>;
};

function firstValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function AttendancePoliciesPage({
  searchParams,
}: AttendancePoliciesPageProps) {
  await requireCanManageEmployees();

  const [
    data,
    resolvedSearchParams,
  ] = await Promise.all([
    getAttendancePolicySettingsPageData(),
    searchParams,
  ]);

  const updated =
    firstValue(
      resolvedSearchParams.notice,
    ) === "updated";

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Attendance Configuration
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Policies
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Manage attendance source permissions,
            photo and location requirements, branch
            defaults, late grace periods, and missing
            time-out automation.
          </p>
        </div>

        <Link
          href="/dashboard/settings"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Settings Overview
        </Link>
      </div>

      {updated ? (
        <section
          role="status"
          className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold leading-6 text-green-800"
        >
          Attendance Policies were updated
          successfully.
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <CalendarClock
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Step 152A-2
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Persistent Attendance Configuration
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Database policy values take priority.
                Environment variables remain
                available as safe fallbacks when a
                setting is missing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Database
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Policy Storage
          </p>

          <div className="mt-2">
            <span
              className={[
                "starland-badge",
                data.resolved.tableExists
                  ? "starland-badge-success"
                  : "starland-badge-danger",
              ].join(" ")}
            >
              {data.resolved.tableExists
                ? "DATABASE READY"
                : "TABLE MISSING"}
            </span>
          </div>
        </article>

        <article className="starland-card p-4">
          <ShieldCheck
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Stored Policies
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.resolved
                .databaseRowCount
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Active Branches
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.branches.length}
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Configuration Warnings
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.resolved
                .warnings.length
            }
          </p>
        </article>
      </section>

      {data.resolved.warnings.length >
      0 ? (
        <section className="space-y-3">
          {data.resolved.warnings.map(
            (warning) => (
              <article
                key={warning}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
              >
                <p className="text-sm font-semibold leading-6 text-amber-800">
                  {warning}
                </p>
              </article>
            ),
          )}
        </section>
      ) : null}

      {data.resolved.tableExists ? (
        <AttendancePolicyForm
          data={data}
        />
      ) : (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-extrabold text-red-900">
            Migration Required
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-red-800">
            Apply the Attendance Policy migration
            before editing these settings.
          </p>
        </section>
      )}
    </section>
  );
}