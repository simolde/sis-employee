import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CloudCog,
  Hourglass,
  KeyRound,
  TimerOff,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationHealthData,
  AttendanceAutomationScheduleComplianceStatus,
} from "../types/attendance-automation-health-types";

type AttendanceAutomationScheduleCardProps = {
  data: AttendanceAutomationHealthData;
};

function statusContainerClass(
  status: AttendanceAutomationScheduleComplianceStatus,
): string {
  switch (status) {
    case "ON_SCHEDULE":
      return "border-green-200 bg-green-50 text-green-800";

    case "NOT_DUE":
      return "border-blue-200 bg-blue-50 text-blue-800";

    case "GRACE_PERIOD":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "LATE_COMPLETED":
      return "border-orange-200 bg-orange-50 text-orange-800";

    case "OVERDUE":
    case "NO_API_RUNS":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function ScheduleStatusIcon({
  status,
}: {
  status: AttendanceAutomationScheduleComplianceStatus;
}) {
  const className =
    "h-7 w-7 shrink-0";

  switch (status) {
    case "ON_SCHEDULE":
      return (
        <CheckCircle2
          className={className}
          aria-hidden="true"
        />
      );

    case "NOT_DUE":
      return (
        <Clock3
          className={className}
          aria-hidden="true"
        />
      );

    case "GRACE_PERIOD":
      return (
        <Hourglass
          className={className}
          aria-hidden="true"
        />
      );

    case "LATE_COMPLETED":
      return (
        <TriangleAlert
          className={className}
          aria-hidden="true"
        />
      );

    case "OVERDUE":
      return (
        <TimerOff
          className={className}
          aria-hidden="true"
        />
      );

    case "NO_API_RUNS":
      return (
        <CircleAlert
          className={className}
          aria-hidden="true"
        />
      );
  }
}

function getTimingMessage(
  data: AttendanceAutomationHealthData,
): string | null {
  const compliance =
    data.scheduleCompliance;

  if (
    compliance.minutesUntilExpectedRun !==
    null
  ) {
    return `${compliance.minutesUntilExpectedRun} minute(s) until the expected run time.`;
  }

  if (
    compliance.minutesUntilGraceDeadline !==
    null
  ) {
    return `${compliance.minutesUntilGraceDeadline} minute(s) remain in the grace period.`;
  }

  if (compliance.minutesLate !== null) {
    return `The latest API run completed ${compliance.minutesLate} minute(s) after the grace deadline.`;
  }

  if (
    compliance.minutesOverdue !== null
  ) {
    return `The scheduled API run is ${compliance.minutesOverdue} minute(s) overdue.`;
  }

  return null;
}

export function AttendanceAutomationScheduleCard({
  data,
}: AttendanceAutomationScheduleCardProps) {
  const timingMessage =
    getTimingMessage(data);

  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarClock
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Daily Scheduler Compliance
          </h2>
        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Scheduler compliance is based only on
          protected API/system runs. Manual dashboard
          executions do not satisfy the daily
          scheduler requirement.
        </p>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1.2fr_2fr]">
        <article
          className={[
            "rounded-2xl border p-5",
            statusContainerClass(
              data.scheduleCompliance.status,
            ),
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <ScheduleStatusIcon
              status={
                data.scheduleCompliance.status
              }
            />

            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">
                Schedule Status
              </p>

              <h3 className="mt-1 text-xl font-extrabold">
                {
                  data.scheduleCompliance
                    .statusLabel
                }
              </h3>

              <p className="mt-2 text-sm font-semibold leading-6">
                {
                  data.scheduleCompliance
                    .statusDescription
                }
              </p>

              {timingMessage ? (
                <p className="mt-3 text-xs font-extrabold">
                  {timingMessage}
                </p>
              ) : null}
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3
              className="h-6 w-6 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Expected Daily Run
            </p>

            <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {
                data.scheduleConfiguration
                  .scheduleLabel
              }
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              Today:{" "}
              {
                data.scheduleCompliance
                  .expectedRunAt
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Hourglass
              className="h-6 w-6 text-[var(--starland-warning)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Grace Deadline
            </p>

            <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {
                data.scheduleConfiguration
                  .graceMinutes
              }{" "}
              minutes
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              {
                data.scheduleCompliance
                  .graceDeadline
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CloudCog
              className="h-6 w-6 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Latest API/System Run
            </p>

            <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {data.latestApiRun
                ? `Run #${data.latestApiRun.activityLogId}`
                : "No API run"}
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              {
                data.scheduleCompliance
                  .latestApiRunAt ??
                "No protected endpoint run is recorded."
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <KeyRound
              className="h-6 w-6 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Schedule Configuration
            </p>

            <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {
                data.scheduleConfiguration
                  .source
              }
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              API runs today:{" "}
              {data.summary.apiRunsToday}
            </p>
          </article>
        </div>
      </div>

      {data.scheduleConfiguration
        .invalidVariables.length > 0 ? (
        <div className="border-t border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800">
          Invalid schedule variables were replaced
          with safe defaults:{" "}
          {data.scheduleConfiguration.invalidVariables.join(
            ", ",
          )}
          .
        </div>
      ) : null}
    </section>
  );
}