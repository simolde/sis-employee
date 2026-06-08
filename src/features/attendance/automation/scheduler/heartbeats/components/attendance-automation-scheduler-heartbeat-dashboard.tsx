import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Clock3,
  HeartPulse,
  History,
  PauseCircle,
  Play,
  SkipForward,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationSchedulerHeartbeatData,
  AttendanceAutomationSchedulerHeartbeatOutcome,
  AttendanceAutomationSchedulerHeartbeatState,
  AttendanceAutomationSchedulerTaskHeartbeatStatus,
} from "../types/attendance-automation-scheduler-heartbeat-types";

type AttendanceAutomationSchedulerHeartbeatDashboardProps = {
  data:
    AttendanceAutomationSchedulerHeartbeatData;
};

function stateContainerClass(
  state:
    AttendanceAutomationSchedulerHeartbeatState,
): string {
  switch (state) {
    case "HEALTHY":
      return "border-green-200 bg-green-50 text-green-800";

    case "ATTENTION":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "MISSING":
      return "border-red-200 bg-red-50 text-red-800";

    case "DISABLED":
      return "border-blue-200 bg-blue-50 text-blue-800";
  }
}

function StateIcon({
  state,
  className,
}: {
  state:
    AttendanceAutomationSchedulerHeartbeatState;

  className: string;
}) {
  switch (state) {
    case "HEALTHY":
      return (
        <CheckCircle2
          className={className}
          aria-hidden="true"
        />
      );

    case "ATTENTION":
      return (
        <TriangleAlert
          className={className}
          aria-hidden="true"
        />
      );

    case "MISSING":
      return (
        <CircleAlert
          className={className}
          aria-hidden="true"
        />
      );

    case "DISABLED":
      return (
        <PauseCircle
          className={className}
          aria-hidden="true"
        />
      );
  }
}

function outcomeBadgeClass(
  outcome:
    AttendanceAutomationSchedulerHeartbeatOutcome,
): string {
  switch (outcome) {
    case "SUCCESS":
      return "starland-badge-success";

    case "ATTENTION":
      return "starland-badge-warning";

    case "SKIPPED":
      return "starland-badge-info";

    case "FAILED":
      return "starland-badge-danger";
  }
}

function TaskStatusCard({
  status,
}: {
  status:
    AttendanceAutomationSchedulerTaskHeartbeatStatus;
}) {
  const TaskIcon =
    status.task === "AUTOMATION"
      ? Play
      : HeartPulse;

  return (
    <article className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <TaskIcon
            className="h-6 w-6 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Hostinger Cron Task
            </p>

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              {status.task}
            </h2>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div
          className={[
            "rounded-2xl border p-4",
            stateContainerClass(
              status.state,
            ),
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <StateIcon
              state={status.state}
              className="mt-0.5 h-6 w-6 shrink-0"
            />

            <div>
              <h3 className="font-extrabold">
                {status.stateLabel}
              </h3>

              <p className="mt-2 text-sm font-semibold leading-6">
                {
                  status.stateDescription
                }
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Expected Window
            </dt>

            <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
              {status.expectedAt}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Latest Receipt
            </dt>

            <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
              {status.latestReceipt
                ? `#${status.latestReceipt.activityLogId} — ${status.latestReceipt.createdAt}`
                : "No receipt"}
            </dd>
          </div>

          {status.latestReceipt ? (
            <>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Outcome
                </dt>

                <dd className="mt-2">
                  <span
                    className={[
                      "starland-badge",
                      outcomeBadgeClass(
                        status
                          .latestReceipt
                          .outcome,
                      ),
                    ].join(" ")}
                  >
                    {
                      status
                        .latestReceipt
                        .outcome
                    }
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Duration
                </dt>

                <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                  {
                    status.latestReceipt
                      .durationLabel
                  }
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

export function AttendanceAutomationSchedulerHeartbeatDashboard({
  data,
}: AttendanceAutomationSchedulerHeartbeatDashboardProps) {
  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          stateContainerClass(
            data.overallState,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <StateIcon
            state={data.overallState}
            className="h-8 w-8 shrink-0"
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Hostinger Scheduler Receipts
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

      <section
        className={[
          "rounded-2xl border p-4",
          data.monitoring.valid
            ? data.monitoring.enabled
              ? "border-green-200 bg-green-50"
              : "border-blue-200 bg-blue-50"
            : "border-amber-200 bg-amber-50",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          {data.monitoring.valid ? (
            data.monitoring.enabled ? (
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
                aria-hidden="true"
              />
            ) : (
              <PauseCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
                aria-hidden="true"
              />
            )
          ) : (
            <TriangleAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              aria-hidden="true"
            />
          )}

          <div>
            <h2
              className={[
                "font-extrabold",
                data.monitoring.valid
                  ? data.monitoring.enabled
                    ? "text-green-800"
                    : "text-blue-800"
                  : "text-amber-800",
              ].join(" ")}
            >
              {data.monitoring.statusLabel}
            </h2>

            <p
              className={[
                "mt-1 text-sm font-semibold leading-6",
                data.monitoring.valid
                  ? data.monitoring.enabled
                    ? "text-green-700"
                    : "text-blue-700"
                  : "text-amber-700",
              ].join(" ")}
            >
              {
                data.monitoring
                  .statusDescription
              }
            </p>

            <code
              className={[
                "mt-3 block rounded-xl border bg-white/70 px-3 py-2 text-xs font-bold",
                data.monitoring.valid
                  ? data.monitoring.enabled
                    ? "border-green-200 text-green-800"
                    : "border-blue-200 text-blue-800"
                  : "border-amber-200 text-amber-800",
              ].join(" ")}
            >
              {
                data.monitoring
                  .variableName
              }
              =&quot;
              {
                data.monitoring
                  .normalizedValue
              }
              &quot;
            </code>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <TaskStatusCard
          status={
            data.taskStatus.automation
          }
        />

        <TaskStatusCard
          status={
            data.taskStatus.health
          }
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <History
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Receipts
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalReceipts}
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Successful
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .successfulReceipts
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <SkipForward
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Skipped
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .skippedReceipts
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Failed
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .failedReceipts
            }
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
              Recent Hostinger Cron Receipts
            </h2>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Latest receipts within the{" "}
            {data.monitoringWindowDays}-day
            monitoring window. Receipt history
            remains available even while monitoring
            is disabled.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Task</th>
                <th>Outcome</th>
                <th>HTTP</th>
                <th>Started</th>
                <th>Finished</th>
                <th>Duration</th>
                <th>Message</th>
              </tr>
            </thead>

            <tbody>
              {data.recentReceipts.length >
              0 ? (
                data.recentReceipts.map(
                  (receipt) => (
                    <tr
                      key={
                        receipt.activityLogId
                      }
                    >
                      <td>
                        <p className="font-extrabold text-[var(--starland-dark-text)]">
                          #
                          {
                            receipt.activityLogId
                          }
                        </p>

                        <code className="mt-1 block max-w-56 break-all text-xs text-[var(--starland-muted-text)]">
                          {receipt.receiptKey}
                        </code>
                      </td>

                      <td>
                        <strong>
                          {receipt.task}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={[
                            "starland-badge",
                            outcomeBadgeClass(
                              receipt.outcome,
                            ),
                          ].join(" ")}
                        >
                          {receipt.outcome}
                        </span>
                      </td>

                      <td>
                        {receipt.httpStatus ??
                          "—"}
                      </td>

                      <td>
                        {receipt.startedAt}
                      </td>

                      <td>
                        {receipt.finishedAt}
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <Clock3
                            className="h-4 w-4 text-[var(--starland-info)]"
                            aria-hidden="true"
                          />

                          <strong>
                            {
                              receipt.durationLabel
                            }
                          </strong>
                        </div>
                      </td>

                      <td>
                        <p className="max-w-80 whitespace-normal text-sm leading-6 text-[var(--starland-muted-text)]">
                          {receipt.message ??
                            "No message recorded."}
                        </p>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        No Hostinger cron receipts
                      </p>

                      <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                        Upload the production shell
                        scripts or submit a manual
                        test receipt.
                      </p>
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