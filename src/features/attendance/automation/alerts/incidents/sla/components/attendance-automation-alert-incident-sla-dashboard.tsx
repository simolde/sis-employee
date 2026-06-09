import Link from "next/link";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Gauge,
  History,
  ShieldAlert,
  Timer,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";
import type {
  AttendanceAutomationAlertIncidentSlaData,
  AttendanceAutomationAlertIncidentSlaOverallStatus,
  AttendanceAutomationAlertIncidentSlaState,
} from "../types/attendance-automation-alert-incident-sla-types";

type AttendanceAutomationAlertIncidentSlaDashboardProps = {
  data:
    AttendanceAutomationAlertIncidentSlaData;
};

function overallContainerClass(
  status:
    AttendanceAutomationAlertIncidentSlaOverallStatus,
): string {
  switch (status) {
    case "HEALTHY":
      return "border-green-200 bg-green-50 text-green-800";

    case "WARNING":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "BREACHED":
      return "border-red-200 bg-red-50 text-red-800";

    case "NO_DATA":
      return "border-blue-200 bg-blue-50 text-blue-800";
  }
}

function slaBadgeClass(
  state:
    AttendanceAutomationAlertIncidentSlaState,
): string {
  switch (state) {
    case "WITHIN_TARGET":
      return "starland-badge-success";

    case "AT_RISK":
      return "starland-badge-warning";

    case "BREACHED":
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

function SlaStatusIcon({
  status,
}: {
  status:
    AttendanceAutomationAlertIncidentSlaOverallStatus;
}) {
  switch (status) {
    case "HEALTHY":
      return (
        <CheckCircle2
          className="h-8 w-8 shrink-0"
          aria-hidden="true"
        />
      );

    case "WARNING":
      return (
        <TriangleAlert
          className="h-8 w-8 shrink-0"
          aria-hidden="true"
        />
      );

    case "BREACHED":
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

function durationLabel(
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
    Math.floor(
      value / 24,
    );

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

export function AttendanceAutomationAlertIncidentSlaDashboard({
  data,
}: AttendanceAutomationAlertIncidentSlaDashboardProps) {
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
          <SlaStatusIcon
            status={data.overallStatus}
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Automation Incident SLA
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
            {
              data.summary
                .totalOpenIncidents
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Within Target
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .withinTargetIncidents
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <TriangleAlert
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            At Risk
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .atRiskIncidents
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            SLA Breaches
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .breachedIncidents
            }
          </p>

          <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
            {
              data.summary
                .breachRate
            }
            % of open incidents
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Timer
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Critical Target
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.configuration
                .critical.targetHours
            }{" "}
            hr
          </p>
        </article>

        <article className="starland-card p-4">
          <Timer
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Warning Target
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.configuration
                .warning.targetHours
            }{" "}
            hr
          </p>
        </article>

        <article className="starland-card p-4">
          <Timer
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Information Target
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.configuration
                .informational
                .targetHours
            }{" "}
            hr
          </p>
        </article>

        <article className="starland-card p-4">
          <Gauge
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            At-Risk Threshold
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.configuration
                .warningPercent
            }
            %
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Nearest Deadline
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {durationLabel(
              data.summary
                .nearestDeadlineHours,
            )}
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Maximum Overdue
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {durationLabel(
              data.summary
                .maximumOverdueHours,
            )}
          </p>
        </article>
      </section>

      {data.issues.length > 0 ? (
        <section className="space-y-3">
          {data.issues.map(
            (issue) => (
              <article
                key={issue}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <TriangleAlert
                    className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold leading-6 text-amber-800">
                    {issue}
                  </p>
                </div>
              </article>
            ),
          )}
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Open Incident SLA Status
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Open incidents are evaluated using the
            resolution target for their current
            severity.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>SLA State</th>
                <th>Severity</th>
                <th>Alert Code</th>
                <th>Incident</th>
                <th>Opened</th>
                <th>Deadline</th>
                <th>Elapsed</th>
                <th>Remaining / Overdue</th>
                <th>Progress</th>
                <th>Evidence</th>
              </tr>
            </thead>

            <tbody>
              {data.incidents.length >
              0 ? (
                data.incidents.map(
                  (incident) => (
                    <tr
                      key={
                        incident.incidentKey
                      }
                    >
                      <td>
                        <span
                          className={[
                            "starland-badge",
                            slaBadgeClass(
                              incident.slaState,
                            ),
                          ].join(" ")}
                        >
                          {incident.slaState}
                        </span>
                      </td>

                      <td>
                        <span
                          className={[
                            "starland-badge",
                            severityBadgeClass(
                              incident.severity,
                            ),
                          ].join(" ")}
                        >
                          {incident.severity}
                        </span>

                        {incident.peakSeverity !==
                        incident.severity ? (
                          <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
                            Peak:{" "}
                            {
                              incident
                                .peakSeverity
                            }
                          </p>
                        ) : null}
                      </td>

                      <td>
                        <code className="text-xs font-bold">
                          {
                            incident.alertCode
                          }
                        </code>
                      </td>

                      <td>
                        <p className="max-w-sm font-bold text-[var(--starland-dark-text)]">
                          {incident.title}
                        </p>

                        <p className="mt-1 break-all text-xs text-[var(--starland-muted-text)]">
                          {
                            incident.incidentKey
                          }
                        </p>
                      </td>

                      <td>
                        <p className="min-w-44">
                          {incident.openedAt}
                        </p>
                      </td>

                      <td>
                        <p className="min-w-44">
                          {incident.deadlineAt}
                        </p>

                        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                          Target:{" "}
                          {
                            incident.targetHours
                          }{" "}
                          hr
                        </p>
                      </td>

                      <td>
                        <strong>
                          {
                            incident.elapsedLabel
                          }
                        </strong>
                      </td>

                      <td>
                        {incident.slaState ===
                        "BREACHED" ? (
                          <span className="font-bold text-red-700">
                            {
                              incident.overdueLabel
                            }{" "}
                            overdue
                          </span>
                        ) : (
                          <span className="font-bold text-[var(--starland-dark-text)]">
                            {
                              incident.remainingLabel
                            }{" "}
                            remaining
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="min-w-36">
                          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[var(--starland-muted-text)]">
                            <span>
                              {
                                incident.progressPercent
                              }
                              %
                            </span>

                            <span>
                              {
                                incident.observationCount
                              }{" "}
                              obs.
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={[
                                "h-full rounded-full",
                                incident.slaState ===
                                "BREACHED"
                                  ? "bg-red-600"
                                  : incident.slaState ===
                                      "AT_RISK"
                                    ? "bg-amber-500"
                                    : "bg-[var(--starland-main-green)]",
                              ].join(" ")}
                              style={{
                                width:
                                  `${incident.progressPercent}%`,
                              }}
                            />
                          </div>
                        </div>
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
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={10}>
                    <div className="p-6 text-center">
                      <CheckCircle2
                        className="mx-auto h-8 w-8 text-[var(--starland-success)]"
                        aria-hidden="true"
                      />

                      <p className="mt-3 font-bold text-[var(--starland-dark-text)]">
                        No open incidents require SLA evaluation.
                      </p>
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
          The SLA clock starts when an alert first
          appears in an immutable snapshot. The clock
          stops when a later snapshot no longer
          contains that alert.
        </p>

        <p className="mt-2">
          Snapshot history analyzed:{" "}
          <strong>
            {
              data.metadata
                .lifecycleSnapshotCount
            }
          </strong>
          . Monitoring window:{" "}
          <strong>
            {
              data.metadata
                .monitoringWindowDays
            }{" "}
            days
          </strong>
          .
        </p>
      </section>
    </div>
  );
}