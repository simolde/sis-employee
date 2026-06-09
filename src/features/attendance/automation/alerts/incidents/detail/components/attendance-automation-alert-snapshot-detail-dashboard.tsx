import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileClock,
  History,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationAlertOverallStatus,
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";
import type {
  AttendanceAutomationAlertSnapshotComparisonKind,
  AttendanceAutomationAlertSnapshotDetailData,
} from "../types/attendance-automation-alert-snapshot-detail-types";

type AttendanceAutomationAlertSnapshotDetailDashboardProps = {
  data:
    AttendanceAutomationAlertSnapshotDetailData;
};

function overallContainerClass(
  status:
    AttendanceAutomationAlertOverallStatus,
): string {
  switch (status) {
    case "HEALTHY":
      return "border-green-200 bg-green-50 text-green-800";

    case "ATTENTION":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "CRITICAL":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function severityBadgeClass(
  severity:
    AttendanceAutomationAlertSeverity | null,
): string {
  switch (severity) {
    case "CRITICAL":
      return "starland-badge-danger";

    case "WARNING":
      return "starland-badge-warning";

    case "INFO":
      return "starland-badge-info";

    case null:
      return "bg-slate-100 text-slate-700";
  }
}

function comparisonBadgeClass(
  kind:
    AttendanceAutomationAlertSnapshotComparisonKind,
): string {
  switch (kind) {
    case "OPENED":
      return "starland-badge-danger";

    case "RESOLVED":
      return "starland-badge-success";

    case "SEVERITY_CHANGED":
      return "starland-badge-warning";

    case "CONTENT_CHANGED":
      return "starland-badge-info";

    case "UNCHANGED":
      return "bg-slate-100 text-slate-700";
  }
}

function OverallStatusIcon({
  status,
}: {
  status:
    AttendanceAutomationAlertOverallStatus;
}) {
  switch (status) {
    case "HEALTHY":
      return (
        <CheckCircle2
          className="h-8 w-8 shrink-0"
          aria-hidden="true"
        />
      );

    case "ATTENTION":
      return (
        <TriangleAlert
          className="h-8 w-8 shrink-0"
          aria-hidden="true"
        />
      );

    case "CRITICAL":
      return (
        <CircleAlert
          className="h-8 w-8 shrink-0"
          aria-hidden="true"
        />
      );
  }
}

export function AttendanceAutomationAlertSnapshotDetailDashboard({
  data,
}: AttendanceAutomationAlertSnapshotDetailDashboardProps) {
  const snapshot =
    data.snapshot;

  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          overallContainerClass(
            snapshot.overallStatus,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <OverallStatusIcon
            status={
              snapshot.overallStatus
            }
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Automation Alert Snapshot
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              Snapshot #
              {snapshot.activityLogId}
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6">
              Overall status:{" "}
              <strong>
                {snapshot.overallStatus}
              </strong>
              . Evaluated{" "}
              {snapshot.evaluatedAt}.
            </p>

            <p className="mt-2 break-all text-xs font-bold">
              {snapshot.snapshotKey}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {data.previousSnapshot ? (
            <Link
              href={`/dashboard/attendance/automation/alerts/incidents/${data.previousSnapshot.activityLogId}`}
              className="starland-btn starland-btn-soft"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Previous #
              {
                data.previousSnapshot
                  .activityLogId
              }
            </Link>
          ) : (
            <span className="starland-btn starland-btn-soft pointer-events-none opacity-50">
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              No Previous Snapshot
            </span>
          )}

          {data.nextSnapshot ? (
            <Link
              href={`/dashboard/attendance/automation/alerts/incidents/${data.nextSnapshot.activityLogId}`}
              className="starland-btn starland-btn-soft"
            >
              Next #
              {
                data.nextSnapshot
                  .activityLogId
              }

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <span className="starland-btn starland-btn-soft pointer-events-none opacity-50">
              No Next Snapshot

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>
          )}
        </div>

        <Link
          href={`/dashboard/attendance/automation/alerts/incidents/${snapshot.activityLogId}`}
          className="starland-btn starland-btn-primary"
        >
          <RefreshCw
            className="h-4 w-4"
            aria-hidden="true"
          />

          Refresh Snapshot
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <ShieldAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Active Alerts
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {snapshot.summary.totalAlerts}
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Opened
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.comparison
                .openedAlerts
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Resolved
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.comparison
                .resolvedAlerts
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <FileClock
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Changes
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.comparison
                .totalChanges
            }
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Critical
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              snapshot.summary
                .criticalAlerts
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Warnings
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              snapshot.summary
                .warningAlerts
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Information
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              snapshot.summary
                .informationalAlerts
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Unchanged
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.comparison
                .unchangedAlerts
            }
          </p>
        </article>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <History
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Snapshot Comparison
            </h2>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            {data.comparison
              .hasPreviousSnapshot
              ? `Compared against snapshot #${data.previousSnapshot?.activityLogId}.`
              : "This is the first available snapshot, so all active alerts are classified as opened."}
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Change</th>
                <th>Code</th>
                <th>Alert</th>
                <th>Previous Severity</th>
                <th>Current Severity</th>
              </tr>
            </thead>

            <tbody>
              {data.comparison.items.length >
              0 ? (
                data.comparison.items.map(
                  (item) => (
                    <tr
                      key={
                        item.comparisonKey
                      }
                    >
                      <td>
                        <span
                          className={[
                            "starland-badge",
                            comparisonBadgeClass(
                              item.kind,
                            ),
                          ].join(" ")}
                        >
                          {item.kind}
                        </span>
                      </td>

                      <td>
                        <code className="text-xs font-bold">
                          {item.code}
                        </code>
                      </td>

                      <td>
                        <p className="font-bold">
                          {item.title}
                        </p>

                        <p className="mt-1 max-w-xl whitespace-normal text-xs leading-5 text-[var(--starland-muted-text)]">
                          {item.currentAlert
                            ?.message ??
                            item.previousAlert
                              ?.message}
                        </p>
                      </td>

                      <td>
                        <span
                          className={[
                            "starland-badge",
                            severityBadgeClass(
                              item.previousSeverity,
                            ),
                          ].join(" ")}
                        >
                          {item.previousSeverity ??
                            "NONE"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={[
                            "starland-badge",
                            severityBadgeClass(
                              item.currentSeverity,
                            ),
                          ].join(" ")}
                        >
                          {item.currentSeverity ??
                            "NONE"}
                        </span>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                      No alerts or comparison items were found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Active Alerts in This Snapshot
          </h2>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Code</th>
                <th>Alert</th>
                <th>Details</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {snapshot.alerts.length >
              0 ? (
                snapshot.alerts.map(
                  (alert) => (
                    <tr key={alert.code}>
                      <td>
                        <span
                          className={[
                            "starland-badge",
                            severityBadgeClass(
                              alert.severity,
                            ),
                          ].join(" ")}
                        >
                          {alert.severity}
                        </span>
                      </td>

                      <td>
                        <code className="text-xs font-bold">
                          {alert.code}
                        </code>
                      </td>

                      <td>
                        <p className="font-bold">
                          {alert.title}
                        </p>

                        <p className="mt-1 max-w-lg whitespace-normal text-sm leading-6 text-[var(--starland-muted-text)]">
                          {alert.message}
                        </p>
                      </td>

                      <td>
                        {alert.details.length >
                        0 ? (
                          <ul className="max-w-xl space-y-1 text-xs leading-5 text-[var(--starland-muted-text)]">
                            {alert.details.map(
                              (
                                detail,
                                index,
                              ) => (
                                <li
                                  key={`${alert.code}:${index}`}
                                >
                                  • {detail}
                                </li>
                              ),
                            )}
                          </ul>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        {alert.action ? (
                          <Link
                            href={
                              alert.action.href
                            }
                            className="starland-btn starland-btn-soft starland-btn-sm"
                          >
                            {
                              alert.action
                                .label
                            }
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="p-6 text-center">
                      <CheckCircle2
                        className="mx-auto h-8 w-8 text-[var(--starland-success)]"
                        aria-hidden="true"
                      />

                      <p className="mt-3 font-bold text-[var(--starland-dark-text)]">
                        This snapshot contains no active alerts.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Snapshot key
            </dt>

            <dd className="mt-1 break-all font-semibold text-[var(--starland-dark-text)]">
              {snapshot.snapshotKey}
            </dd>
          </div>

          <div>
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Fingerprint
            </dt>

            <dd className="mt-1 break-all font-mono text-xs text-[var(--starland-dark-text)]">
              {snapshot.fingerprint}
            </dd>
          </div>

          <div>
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Evaluated
            </dt>

            <dd className="mt-1 font-semibold text-[var(--starland-dark-text)]">
              {snapshot.evaluatedAt}
            </dd>
          </div>

          <div>
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Activity log created
            </dt>

            <dd className="mt-1 font-semibold text-[var(--starland-dark-text)]">
              {snapshot.createdAt}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}