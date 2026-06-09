import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  History,
  RefreshCw,
  TimerReset,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationAlertIncidentLifecycleDashboard } from "@/features/attendance/automation/alerts/incidents/lifecycle/components/attendance-automation-alert-incident-lifecycle-dashboard";
import { getAttendanceAutomationAlertIncidentLifecycleData } from "@/features/attendance/automation/alerts/incidents/lifecycle/server/attendance-automation-alert-incident-lifecycle-queries";

export const dynamic =
  "force-dynamic";

export default async function AttendanceAutomationAlertIncidentLifecyclePage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationAlertIncidentLifecycleData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Automation Incident Analytics
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Alert Incident Lifecycle
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Track alert incidents from their first
            snapshot appearance through resolution,
            including duration, severity escalation,
            observation count, and mean time to
            resolution.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/alerts/incidents/lifecycle"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Refresh Lifecycle
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
            <TimerReset
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Snapshot-Derived Incidents
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Alert Resolution and Duration Analytics
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Each alert appearance starts an
                incident. The incident remains open
                while the alert exists in subsequent
                snapshots and resolves when the alert
                disappears.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationAlertIncidentLifecycleDashboard
        data={data}
      />
    </section>
  );
}