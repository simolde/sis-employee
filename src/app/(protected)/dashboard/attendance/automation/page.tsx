import Link from "next/link";
import {
  Activity,
  BellRing,
  History,
  Play,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationOverview } from "@/features/attendance/automation/overview/components/attendance-automation-overview";
import { getAttendanceAutomationOverviewData } from "@/features/attendance/automation/overview/server/attendance-automation-overview-queries";

export const dynamic = "force-dynamic";

export default async function AttendanceAutomationPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationOverviewData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Attendance Operations
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Monitor approved-leave attendance
            generation, protected API execution,
            scheduler compliance, failures, retries,
            and operational alerts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/approved-leave-excused"
            className="starland-btn starland-btn-primary"
          >
            <Play
              className="h-4 w-4"
              aria-hidden="true"
            />

            Run Automation
          </Link>

          <Link
            href="/dashboard/attendance/automation/alerts"
            className="starland-btn starland-btn-soft"
          >
            <BellRing
              className="h-4 w-4"
              aria-hidden="true"
            />

            View Alerts
          </Link>

          <Link
            href="/dashboard/attendance/automation/health"
            className="starland-btn starland-btn-soft"
          >
            <Activity
              className="h-4 w-4"
              aria-hidden="true"
            />

            Health
          </Link>

          <Link
            href="/dashboard/attendance/automation/approved-leave-excused/history"
            className="starland-btn starland-btn-soft"
          >
            <History
              className="h-4 w-4"
              aria-hidden="true"
            />

            Run History
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Live Operations Overview
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Approved-Leave EXCUSED Automation
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Approved employee leave dates can be
            converted automatically into EXCUSED
            attendance while existing attendance,
            exception dates, schedules, and duplicate
            records remain protected.
          </p>
        </div>
      </section>

      <AttendanceAutomationOverview
        data={data}
      />
    </section>
  );
}