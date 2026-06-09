import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  History,
  RefreshCw,
  Timer,
  TimerReset,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationAlertIncidentSlaDashboard } from "@/features/attendance/automation/alerts/incidents/sla/components/attendance-automation-alert-incident-sla-dashboard";
import { getAttendanceAutomationAlertIncidentSlaData } from "@/features/attendance/automation/alerts/incidents/sla/server/attendance-automation-alert-incident-sla-queries";

export const dynamic =
  "force-dynamic";

export default async function AttendanceAutomationAlertIncidentSlaPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationAlertIncidentSlaData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Incident Resolution Targets
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Automation Incident SLA
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Monitor open automation-alert incidents
            against configurable critical, warning,
            and informational resolution targets.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/alerts/incidents/sla"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Refresh SLA
          </Link>

          <Link
            href="/dashboard/attendance/automation/alerts/incidents/lifecycle"
            className="starland-btn starland-btn-soft"
          >
            <TimerReset
              className="h-4 w-4"
              aria-hidden="true"
            />

            Incident Lifecycle
          </Link>

          <Link
            href="/dashboard/attendance/automation/alerts/incidents"
            className="starland-btn starland-btn-soft"
          >
            <History
              className="h-4 w-4"
              aria-hidden="true"
            />

            Incident Timeline
          </Link>

          <Link
            href="/dashboard/attendance/automation/alerts"
            className="starland-btn starland-btn-soft"
          >
            <BellRing
              className="h-4 w-4"
              aria-hidden="true"
            />

            Active Alerts
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
            <Timer
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Severity-Based SLA
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Automation Incident Resolution Monitoring
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Every open incident receives a
                deadline based on its current alert
                severity. Incidents approaching the
                deadline are marked at risk, while
                overdue incidents are marked
                breached.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationAlertIncidentSlaDashboard
        data={data}
      />
    </section>
  );
}