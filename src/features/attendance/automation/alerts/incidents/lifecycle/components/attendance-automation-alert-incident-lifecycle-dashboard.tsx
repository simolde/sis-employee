import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Clock3,
  History,
  ShieldAlert,
  TimerReset,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";
import type {
  AttendanceAutomationAlertIncidentLifecycleData,
  AttendanceAutomationAlertIncidentLifecycleOverallStatus,
  AttendanceAutomationAlertIncidentLifecycleRecord,
} from "../types/attendance-automation-alert-incident-lifecycle-types";

type AttendanceAutomationAlertIncidentLifecycleDashboardProps = {
  data:
    AttendanceAutomationAlertIncidentLifecycleData;
};

function overallContainerClass(
  status:
    AttendanceAutomationAlertIncidentLifecycleOverallStatus,
): string {
  switch (status) {
    case "HEALTHY":
      return "border-green-200 bg-green-50 text-green-800";

    case "ATTENTION":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "CRITICAL":
      return "border-red-200 bg-red-50 text-red-800";

    case "NO_DATA":
      return "border-blue-200 bg-blue-50 text-blue-800";
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

function LifecycleStatusIcon({
  status,
}: {
  status:
    AttendanceAutomationAlertIncidentLifecycleOverallStatus;
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

    case "NO_DATA":
      return (
        <History
          className="h-8 w-8 shrink-0"
          aria-hidden="true"
        />
      );
  }
}

function durationValue(
  value: number | null,
): string {
  if (value === null) {
    return "No data";
  }

  if (value < 1) {
    return `${Math.round(value * 60)} min`;
  }

  if (value < 24) {
    return `${value.toFixed(2)} hr`;
  }

  const days =
    Math.floor(value / 24);

  const hours =
    Number(
      (
        value -
        days * 24
      ).toFixed(2),
    );

  return hours > 0
    ? `${days}d ${hours}h`
    : `${days}d`;
}

function IncidentRow({
  incident,
}: {
  incident:
    AttendanceAutomationAlertIncidentLifecycleRecord;
}) {
  return (
    <tr>
      <td>
        <span
          className={[
            "starland-badge",
            incident.status === "OPEN"
              ? "starland-badge-danger"
              : "starland-badge-success",
          ].join(" ")}
        >
          {incident.status}
        </span>
      </td>

      <td>
        <span
          className={[
            "starland-badge",
            severityBadgeClass(
              incident.currentSeverity,
            ),
          ].join(" ")}
        >
          {incident.currentSeverity}
        </span>

        {incident.peakSeverity !==
        incident.currentSeverity ? (
          <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
            Peak:{" "}
            {incident.peakSeverity}
          </p>
        ) : null}
      </td>

      <td>
        <code className="text-xs font-bold">
          {incident.alertCode}
        </code>
      </td>

      <td>
        <p className="max-w-sm font-bold text-[var(--starland-dark-text)]">
          {incident.title}
        </p>

        <p className="mt-1 break-all text-xs text-[var(--starland-muted-text)]">
          {incident.incidentKey}
        </p>
      </td>

      <td>
        <p className="min-w-44">
          {incident.openedAt}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          Snapshot #
          {
            incident
              .openedSnapshotActivityLogId
          }
        </p>
      </td>

      <td>
        <p className="min-w-44">
          {incident.resolvedAt ??
            "Still open"}
        </p>

        {incident.resolvedSnapshotActivityLogId !==
        null ? (
          <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
            Snapshot #
            {
              incident
                .resolvedSnapshotActivityLogId
            }
          </p>
        ) : null}
      </td>

      <td>
        <strong>
          {incident.durationLabel}
        </strong>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          {incident.durationHours} hours
        </p>
      </td>

      <td>
        <p>
          {
            incident
              .observationCount
          }{" "}
          snapshot
          {incident.observationCount ===
          1
            ? ""
            : "s"}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          {
            incident
              .severityChangeCount
          }{" "}
          severity change
          {incident.severityChangeCount ===
          1
            ? ""
            : "s"}
        </p>
      </td>

      <td>
        <Link
          href={`/dashboard/attendance/automation/alerts/incidents/${incident.lastObservedSnapshotActivityLogId}`}
          className="starland-btn starland-btn-soft starland-btn-sm"
        >
          Snapshot #
          {
            incident
              .lastObservedSnapshotActivityLogId
          }
        </Link>
      </td>
    </tr>
  );
}

export function AttendanceAutomationAlertIncidentLifecycleDashboard({
  data,
}: AttendanceAutomationAlertIncidentLifecycleDashboardProps) {
  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          overallContainerClass(
            data.overallStatus,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <LifecycleStatusIcon
            status={data.overallStatus}
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Automation Incident Lifecycle
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {data.overallLabel}
            </h2>

            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6">
              {data.overallDescription}
            </p>

            <p className="mt-3 text-xs font-bold">
              Evaluated: {data.generatedAt}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <ShieldAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Open Incidents
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.openIncidents}
          </p>

          <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
            {
              data.summary
                .criticalOpenIncidents
            }{" "}
            critical
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Resolved Incidents
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .resolvedIncidents
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <TimerReset
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Mean Time to Resolve
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {durationValue(
              data.summary
                .averageResolutionHours,
            )}
          </p>
        </article>

        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Median Resolution
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {durationValue(
              data.summary
                .medianResolutionHours,
            )}
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Activity
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Incidents
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .totalIncidents
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Longest Open
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {durationValue(
              data.summary
                .longestOpenHours,
            )}
          </p>
        </article>

        <article className="starland-card p-4">
          <History
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Longest Resolved
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {durationValue(
              data.summary
                .longestResolvedHours,
            )}
          </p>
        </article>

        <article className="starland-card p-4">
          <TriangleAlert
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Severity Changes
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .totalSeverityChanges
            }
          </p>
        </article>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldAlert
              className="h-5 w-5 text-[var(--starland-danger)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Currently Open Incidents
            </h2>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Incidents that remain present in the
            latest immutable alert snapshot.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Severity</th>
                <th>Code</th>
                <th>Incident</th>
                <th>Opened</th>
                <th>Resolved</th>
                <th>Duration</th>
                <th>Observations</th>
                <th>Evidence</th>
              </tr>
            </thead>

            <tbody>
              {data.openIncidents.length >
              0 ? (
                data.openIncidents.map(
                  (incident) => (
                    <IncidentRow
                      key={
                        incident.incidentKey
                      }
                      incident={incident}
                    />
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={9}>
                    <div className="p-6 text-center">
                      <CheckCircle2
                        className="mx-auto h-8 w-8 text-[var(--starland-success)]"
                        aria-hidden="true"
                      />

                      <p className="mt-3 font-bold text-[var(--starland-dark-text)]">
                        No incidents remain open.
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
          <div className="flex items-center gap-2">
            <TimerReset
              className="h-5 w-5 text-[var(--starland-success)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Recently Resolved Incidents
            </h2>
          </div>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Severity</th>
                <th>Code</th>
                <th>Incident</th>
                <th>Opened</th>
                <th>Resolved</th>
                <th>Duration</th>
                <th>Observations</th>
                <th>Evidence</th>
              </tr>
            </thead>

            <tbody>
              {data.recentResolvedIncidents
                .length > 0 ? (
                data.recentResolvedIncidents.map(
                  (incident) => (
                    <IncidentRow
                      key={
                        incident.incidentKey
                      }
                      incident={incident}
                    />
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={9}>
                    <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                      No resolved incidents are available.
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
            Incident Performance by Alert Code
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Aggregated occurrence and resolution
            metrics for each automation alert type.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Alert Code</th>
                <th>Latest Title</th>
                <th>Total</th>
                <th>Open</th>
                <th>Resolved</th>
                <th>Critical</th>
                <th>Average Resolution</th>
                <th>Longest Resolution</th>
                <th>Current Open Duration</th>
                <th>Latest Status</th>
              </tr>
            </thead>

            <tbody>
              {data.incidentsByCode.length >
              0 ? (
                data.incidentsByCode.map(
                  (summary) => (
                    <tr
                      key={
                        summary.alertCode
                      }
                    >
                      <td>
                        <code className="text-xs font-bold">
                          {
                            summary.alertCode
                          }
                        </code>
                      </td>

                      <td>
                        <p className="max-w-sm font-bold">
                          {summary.title}
                        </p>
                      </td>

                      <td>
                        {
                          summary.incidentCount
                        }
                      </td>

                      <td>
                        {
                          summary.openIncidentCount
                        }
                      </td>

                      <td>
                        {
                          summary.resolvedIncidentCount
                        }
                      </td>

                      <td>
                        {
                          summary.criticalIncidentCount
                        }
                      </td>

                      <td>
                        {durationValue(
                          summary.averageResolutionHours,
                        )}
                      </td>

                      <td>
                        {durationValue(
                          summary.longestResolutionHours,
                        )}
                      </td>

                      <td>
                        {durationValue(
                          summary.currentOpenDurationHours,
                        )}
                      </td>

                      <td>
                        <span
                          className={[
                            "starland-badge",
                            summary.latestStatus ===
                            "OPEN"
                              ? "starland-badge-danger"
                              : "starland-badge-success",
                          ].join(" ")}
                        >
                          {
                            summary.latestStatus
                          }
                        </span>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={10}>
                    <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                      No incident code summaries are available.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
        <p>
          Lifecycle calculations use the available{" "}
          {data.monitoringWindowDays}-day immutable
          snapshot history. An incident present in
          the earliest available snapshot may have
          started before the current monitoring
          window.
        </p>

        <p className="mt-2">
          Snapshots analyzed:{" "}
          <strong>
            {data.metadata.snapshotCount}
          </strong>
          . First snapshot:{" "}
          <strong>
            {data.metadata.firstSnapshotAt ??
              "None"}
          </strong>
          . Latest snapshot:{" "}
          <strong>
            {data.metadata.latestSnapshotAt ??
              "None"}
          </strong>
          .
        </p>
      </section>
    </div>
  );
}