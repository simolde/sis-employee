import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  ServerCog,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationHostingerScheduler } from "@/features/attendance/automation/scheduler/components/attendance-automation-hostinger-scheduler";
import { AttendanceAutomationSchedulerActivationCard } from "@/features/attendance/automation/scheduler/components/attendance-automation-scheduler-activation-card";
import { getAttendanceAutomationSchedulerData } from "@/features/attendance/automation/scheduler/server/attendance-automation-scheduler-queries";
import { getAttendanceAutomationSchedulerMonitoringConfiguration } from "@/features/attendance/automation/scheduler/server/attendance-automation-scheduler-monitoring-config";

export const dynamic = "force-dynamic";

export default async function AttendanceAutomationSchedulerPage() {
  await requireCanManageEmployees();

  const data =
    getAttendanceAutomationSchedulerData();

  const monitoringConfiguration =
    getAttendanceAutomationSchedulerMonitoringConfiguration();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Hostinger Cron Setup
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation Scheduler
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Configure and activate the production
            automation and health-monitoring cron
            jobs using the correct UTC schedule,
            private credentials, and deployment
            shell scripts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/readiness"
            className="starland-btn starland-btn-primary"
          >
            <ClipboardCheck
              className="h-4 w-4"
              aria-hidden="true"
            />

            Production Readiness
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
            <CalendarClock
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                UTC-Aware Scheduling
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Hostinger Production Cron Jobs
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Cron monitoring should remain
                disabled during local development
                and should only be enabled after both
                Hostinger jobs and their heartbeat
                scripts are deployed.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              <ServerCog
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Hostinger: UTC
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Application: Asia/Manila
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Monitoring:{" "}
              {monitoringConfiguration.enabled
                ? "Enabled"
                : "Disabled"}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Redis: Not Required
            </span>
          </div>
        </div>
      </section>

      <AttendanceAutomationSchedulerActivationCard
        configuration={
          monitoringConfiguration
        }
      />

      <AttendanceAutomationHostingerScheduler
        data={data}
      />
    </section>
  );
}