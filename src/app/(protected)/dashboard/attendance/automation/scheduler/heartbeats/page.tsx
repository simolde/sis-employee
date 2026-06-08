import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  RefreshCw,
  ServerCog,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationSchedulerHeartbeatDashboard } from "@/features/attendance/automation/scheduler/heartbeats/components/attendance-automation-scheduler-heartbeat-dashboard";
import { getAttendanceAutomationSchedulerHeartbeatData } from "@/features/attendance/automation/scheduler/heartbeats/server/attendance-automation-scheduler-heartbeat-queries";

export const dynamic = "force-dynamic";

export default async function AttendanceAutomationSchedulerHeartbeatsPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationSchedulerHeartbeatData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Hostinger Cron Monitoring
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Scheduler Execution Receipts
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Confirm that Hostinger invoked both the
            attendance automation and post-grace
            health-check shell scripts for their
            expected daily scheduling windows.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/scheduler/heartbeats"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Refresh Receipts
          </Link>

          <Link
            href="/dashboard/attendance/automation/scheduler"
            className="starland-btn starland-btn-soft"
          >
            <CalendarClock
              className="h-4 w-4"
              aria-hidden="true"
            />

            Scheduler Setup
          </Link>

          <Link
            href="/dashboard/attendance/automation"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Automation Overview
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <ServerCog
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Immutable Activity Logs
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Hostinger Cron Proof of Execution
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Each production shell script reports
                its final result to a protected API.
                Receipts remain separate from
                attendance generation history so
                missed cron executions can be
                identified clearly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationSchedulerHeartbeatDashboard
        data={data}
      />
    </section>
  );
}