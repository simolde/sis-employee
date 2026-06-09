import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Clock3,
  History,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationAlertIncidentData,
  AttendanceAutomationAlertIncidentTransitionKind,
} from "../types/attendance-automation-alert-incident-types";
import type {
  AttendanceAutomationAlertOverallStatus,
  AttendanceAutomationAlertSeverity,
} from "../../types/attendance-automation-alert-types";

type AttendanceAutomationAlertIncidentDashboardProps = {
  data:
    AttendanceAutomationAlertIncidentData;
};

function overallBadgeClass(
  status:
    AttendanceAutomationAlertOverallStatus,
): string {
  switch (status) {
    case "HEALTHY":
      return "starland-badge-success";

    case "ATTENTION":
      return "starland-badge-warning";

    case "CRITICAL":
      return "starland-badge-danger";
  }
}

function severityBadgeClass(
  severity:
    AttendanceAutomationAlertSeverity,
): string {
  switch (severity) {
    case "CRITICAL":
      return "starland-badge-danger";

    case "WARNING":
      return "starland-badge-warning";

    case "INFO":
      return "starland-badge-info";
  }
}

function transitionBadgeClass(
  kind:
    AttendanceAutomationAlertIncidentTransitionKind,
): string {
  switch (kind) {
    case "ALERT_OPENED":
      return "starland-badge-danger";

    case "ALERT_RESOLVED":
      return "starland-badge-success";

    case "SEVERITY_CHANGED":
      return "starland-badge-warning";

    case "OVERALL_STATUS_CHANGED":
      return "starland-badge-info";
  }
}

export function AttendanceAutomationAlertIncidentDashboard({
  data,
}: AttendanceAutomationAlertIncidentDashboardProps) {
  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          data.latestSnapshot
            ? data.summary.snapshotStale
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          {data.latestSnapshot ? (
            data.summary.snapshotStale ? (
              <TriangleAlert
                className="h-8 w-8 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="h-8 w-8 shrink-0"
                aria-hidden="true"
              />
            )
          ) : (
            <CircleAlert
              className="h-8 w-8 shrink-0"
              aria-hidden="true"
            />
          )}

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Alert Incident Timeline
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {data.latestSnapshot
                ? data.summary.snapshotStale
                  ? "Latest Alert Snapshot Is Stale"
                  : "Alert Snapshot Monitoring Active"
                : "No Alert Snapshot Recorded"}
            </h2>

            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6">
              {data.latestSnapshot
                ? `Latest snapshot #${data.latestSnapshot.activityLogId} was evaluated ${data.latestSnapshot.evaluatedAt}.`
                : "Run the protected alert snapshot endpoint or deploy the updated Hostinger health script."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <History
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Snapshots
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalSnapshots}
          </p>
        </article>

        <article className="starland-card p-4">
          <ShieldAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Current Alerts
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.currentAlertCount}
          </p>
        </article>

        <article className="starland-card p-4">
          <AlertTriangle
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Opened Events
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.openedTransitions}
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Resolved Events
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.resolvedTransitions}
          </p>
        </article>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Current Snapshot Alerts
            </h2>
          </div>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Code</th>
                <th>Alert</th>
                <th>Message</th>
              </tr>
            </thead>

            <tbody>
              {data.currentAlerts.length > 0 ? (
                data.currentAlerts.map(
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
                        <strong>
                          {alert.title}
                        </strong>
                      </td>

                      <td>
                        <p className="max-w-xl whitespace-normal text-sm leading-6 text-[var(--starland-muted-text)]">
                          {alert.message}
                        </p>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="p-6 text-center">
                      <CheckCircle2
                        className="mx-auto h-8 w-8 text-[var(--starland-success)]"
                        aria-hidden="true"
                      />

                      <p className="mt-3 font-bold text-[var(--starland-dark-text)]">
                        No active alerts in the latest snapshot
                      </p>
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
            Alert State Transitions
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Opened, resolved, severity, and overall
            alert-center status changes derived from
            immutable snapshots.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Occurred</th>
                <th>Transition</th>
                <th>Alert</th>
                <th>Previous</th>
                <th>Current</th>
                <th>Snapshot</th>
              </tr>
            </thead>

            <tbody>
              {data.transitions.length > 0 ? (
                data.transitions.map(
                  (transition) => (
                    <tr
                      key={
                        transition.transitionKey
                      }
                    >
                      <td>
                        <div className="flex min-w-44 items-center gap-2">
                          <Clock3
                            className="h-4 w-4 text-[var(--starland-info)]"
                            aria-hidden="true"
                          />

                          <span>
                            {transition.occurredAt}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={[
                            "starland-badge",
                            transitionBadgeClass(
                              transition.kind,
                            ),
                          ].join(" ")}
                        >
                          {transition.kind}
                        </span>
                      </td>

                      <td>
                        <p className="font-bold">
                          {transition.alertTitle}
                        </p>

                        {transition.alertCode ? (
                          <code className="mt-1 block text-xs text-[var(--starland-muted-text)]">
                            {transition.alertCode}
                          </code>
                        ) : null}
                      </td>

                      <td>
                        {transition.previousSeverity ??
                          transition.previousOverallStatus ??
                          "—"}
                      </td>

                      <td>
                        {transition.currentSeverity ??
                          transition.currentOverallStatus ??
                          "—"}
                      </td>

                      <td>
                        #
                        {
                          transition.snapshotActivityLogId
                        }
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                      No alert transitions have been recorded.
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
            Recent Alert Snapshots
          </h2>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Monitoring window:{" "}
            {data.monitoringWindowDays} days.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Snapshot</th>
                <th>Evaluated</th>
                <th>Overall Status</th>
                <th>Total</th>
                <th>Critical</th>
                <th>Warnings</th>
                <th>Information</th>
                <th>Fingerprint</th>
              </tr>
            </thead>

            <tbody>
              {data.recentSnapshots.length >
              0 ? (
                data.recentSnapshots.map(
                  (snapshot) => (
                    <tr
                      key={
                        snapshot.activityLogId
                      }
                    >
                      <td>
                        <strong>
                          #
                          {
                            snapshot.activityLogId
                          }
                        </strong>
                      </td>

                      <td>
                        {snapshot.evaluatedAt}
                      </td>

                      <td>
                        <span
                          className={[
                            "starland-badge",
                            overallBadgeClass(
                              snapshot.overallStatus,
                            ),
                          ].join(" ")}
                        >
                          {snapshot.overallStatus}
                        </span>
                      </td>

                      <td>
                        {
                          snapshot.summary
                            .totalAlerts
                        }
                      </td>

                      <td>
                        {
                          snapshot.summary
                            .criticalAlerts
                        }
                      </td>

                      <td>
                        {
                          snapshot.summary
                            .warningAlerts
                        }
                      </td>

                      <td>
                        {
                          snapshot.summary
                            .informationalAlerts
                        }
                      </td>

                      <td>
                        <code className="text-xs">
                          {snapshot.fingerprint.slice(
                            0,
                            16,
                          )}
                        </code>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                      No alert snapshots have been recorded.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}