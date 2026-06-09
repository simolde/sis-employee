import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  HeartPulse,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationCronReadinessDashboard } from "@/features/attendance/automation/scheduler/readiness/components/attendance-automation-cron-readiness-dashboard";
import { getAttendanceAutomationCronReadinessData } from "@/features/attendance/automation/scheduler/readiness/server/attendance-automation-cron-readiness-queries";

export const dynamic = "force-dynamic";

export default async function AttendanceAutomationCronReadinessPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationCronReadinessData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Hostinger Deployment Preflight
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Cron Monitoring Readiness
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Verify configuration, credentials,
            schedule values, heartbeat history, and
            current-window receipts before enabling
            strict Hostinger cron monitoring.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/scheduler/readiness"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Run Preflight Again
          </Link>

          <Link
            href="/dashboard/attendance/automation/scheduler/heartbeats"
            className="starland-btn starland-btn-soft"
          >
            <HeartPulse
              className="h-4 w-4"
              aria-hidden="true"
            />

            Cron Receipts
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
            <ShieldCheck
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Activation Safety Check
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Hostinger Cron Monitoring Preflight
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Enabling receipt enforcement before
                the Hostinger jobs are deployed
                creates expected missing-receipt
                alerts. This preflight identifies
                those conditions before activation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationCronReadinessDashboard
        data={data}
      />
    </section>
  );
}