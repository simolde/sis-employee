import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  History,
  RefreshCw,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationAlertIncidentDashboard } from "@/features/attendance/automation/alerts/incidents/components/attendance-automation-alert-incident-dashboard";
import { getAttendanceAutomationAlertIncidentData } from "@/features/attendance/automation/alerts/incidents/server/attendance-automation-alert-incident-queries";

export const dynamic =
  "force-dynamic";

export default async function AttendanceAutomationAlertIncidentsPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationAlertIncidentData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Automation Incident History
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Alert Incident Timeline
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review persistent alert snapshots,
            opened and resolved incidents, severity
            changes, and automation alert-center
            status transitions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/alerts/incidents"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Refresh Timeline
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
            <History
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Immutable Activity Logs
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Persistent Automation Alert History
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                A new activity-log snapshot is
                created only when the active alert
                fingerprint changes. Identical
                evaluations reuse the latest
                snapshot.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationAlertIncidentDashboard
        data={data}
      />
    </section>
  );
}