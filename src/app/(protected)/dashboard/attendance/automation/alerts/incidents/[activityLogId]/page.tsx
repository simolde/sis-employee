import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  FileClock,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationAlertSnapshotDetailDashboard } from "@/features/attendance/automation/alerts/incidents/detail/components/attendance-automation-alert-snapshot-detail-dashboard";
import {
  getAttendanceAutomationAlertSnapshotDetailData,
  parseAttendanceAutomationAlertSnapshotActivityLogId,
} from "@/features/attendance/automation/alerts/incidents/detail/server/attendance-automation-alert-snapshot-detail-queries";

export const dynamic =
  "force-dynamic";

type AttendanceAutomationAlertSnapshotDetailPageProps = {
  params: Promise<{
    activityLogId: string;
  }>;
};

export default async function AttendanceAutomationAlertSnapshotDetailPage({
  params,
}: AttendanceAutomationAlertSnapshotDetailPageProps) {
  await requireCanManageEmployees();

  const resolvedParams =
    await params;

  const activityLogId =
    parseAttendanceAutomationAlertSnapshotActivityLogId(
      resolvedParams.activityLogId,
    );

  if (activityLogId === null) {
    notFound();
  }

  const data =
    await getAttendanceAutomationAlertSnapshotDetailData(
      activityLogId,
    );

  if (!data) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Immutable Alert Snapshot
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Alert Snapshot #
            {data.snapshot.activityLogId}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review the complete alert state and
            compare it against the immediately
            preceding immutable automation-alert
            snapshot.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/alerts/incidents"
            className="starland-btn starland-btn-primary"
          >
            <ArrowLeft
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
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <FileClock
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Snapshot Comparison
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Historical Alert-State Evidence
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Opened, resolved, severity-changed,
                content-changed, and unchanged alerts
                are calculated against the preceding
                activity-log snapshot.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationAlertSnapshotDetailDashboard
        data={data}
      />
    </section>
  );
}