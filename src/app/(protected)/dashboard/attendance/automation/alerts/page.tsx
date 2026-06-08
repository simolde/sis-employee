import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BellRing,
  History,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationAlertList } from "@/features/attendance/automation/alerts/components/attendance-automation-alert-list";
import { AttendanceAutomationAlertSummary } from "@/features/attendance/automation/alerts/components/attendance-automation-alert-summary";
import { getAttendanceAutomationAlertCenterData } from "@/features/attendance/automation/alerts/server/attendance-automation-alert-queries";

export const dynamic = "force-dynamic";

export default async function AttendanceAutomationAlertsPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationAlertCenterData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Operations Monitoring
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation Alerts
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review active configuration, scheduler,
            failure, reliability, and execution-lock
            conditions affecting attendance
            automation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/alerts"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Refresh Alerts
          </Link>

          <Link
            href="/dashboard/attendance/automation/health"
            className="starland-btn starland-btn-soft"
          >
            <Activity
              className="h-4 w-4"
              aria-hidden="true"
            />

            Automation Health
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
            <BellRing
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Live Derived Alerts
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Automation Operations Center
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Alerts are generated from the
                current server configuration,
                automation health, scheduler
                compliance, recent run history, and
                active execution lock.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Health:{" "}
              {data.signals.healthStatus}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Schedule:{" "}
              {data.signals.scheduleStatus}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Lock:{" "}
              {data.signals.lockStatus}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Success rate:{" "}
              {data.signals.successRate}%
            </span>
          </div>
        </div>
      </section>

      <AttendanceAutomationAlertSummary
        data={data}
      />

      <AttendanceAutomationAlertList
        alerts={data.alerts}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/attendance/automation/health"
          className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Activity
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-extrabold text-[var(--starland-dark-text)]">
            Automation Health
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Review scheduler compliance, health
            state, and active execution lock.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/configuration"
          className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Settings2
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-extrabold text-[var(--starland-dark-text)]">
            Configuration
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Verify secrets, endpoint URLs, schedule,
            and lock settings.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/reports"
          className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <BellRing
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-extrabold text-[var(--starland-dark-text)]">
            Performance Reports
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Analyze success rate, failures,
            duration, and generated attendance.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/approved-leave-excused/history"
          className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <History
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-extrabold text-[var(--starland-dark-text)]">
            Run History
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Open successful, failed, and retried
            automation run details.
          </p>
        </Link>
      </section>
    </section>
  );
}