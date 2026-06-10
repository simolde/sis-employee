import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  DatabaseSearch,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendancePolicyDiscoveryDashboard } from "@/features/settings/attendance-policies/components/attendance-policy-discovery-dashboard";
import { getAttendancePolicyDiscoveryData } from "@/features/settings/attendance-policies/server/attendance-policy-discovery-queries";

export const dynamic =
  "force-dynamic";

export default async function AttendancePoliciesPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendancePolicyDiscoveryData();

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
            Inspect the current environment
            configuration and database storage before
            enabling editable attendance rules.
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

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <CalendarClock
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Step 152A-1
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Attendance Policy Source Discovery
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Determine whether attendance behavior
                is controlled by environment
                variables, an existing database
                settings table, or a combination of
                both.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-white/10 bg-[var(--starland-modern-bg)] p-4">
          <DatabaseSearch
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="text-sm font-semibold leading-6 text-[var(--starland-muted-text)]">
            This page is read-only. It does not alter
            environment variables, create database
            tables, update policies, or change
            attendance processing.
          </p>
        </div>
      </section>

      <AttendancePolicyDiscoveryDashboard
        data={data}
      />
    </section>
  );
}