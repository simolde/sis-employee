import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  HeartPulse,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationCronReliabilityDashboard } from "@/features/attendance/automation/scheduler/reliability/components/attendance-automation-cron-reliability-dashboard";
import { getAttendanceAutomationCronReliabilityData } from "@/features/attendance/automation/scheduler/reliability/server/attendance-automation-cron-reliability-queries";

export const dynamic = "force-dynamic";

export default async function AttendanceAutomationCronReliabilityPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationCronReliabilityData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Hostinger Cron SLO
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Cron Reliability Monitoring
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Measure active-period Hostinger cron
            coverage, success, on-time performance,
            healthy-day rates, and execution streaks
            without penalizing pre-deployment or
            not-yet-due scheduling windows.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/scheduler/reliability"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Refresh Reliability
          </Link>

          <Link
            href="/dashboard/attendance/automation/scheduler/heartbeats/report"
            className="starland-btn starland-btn-soft"
          >
            <BarChart3
              className="h-4 w-4"
              aria-hidden="true"
            />

            Coverage Report
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
            <TrendingUp
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Activation-Aware Reliability
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Hostinger Cron Service Level Monitoring
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Only dates on or after the effective
                monitoring start date affect the
                reliability windows. Current jobs
                remain pending until their configured
                schedule and tolerance have passed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationCronReliabilityDashboard
        data={data}
      />
    </section>
  );
}