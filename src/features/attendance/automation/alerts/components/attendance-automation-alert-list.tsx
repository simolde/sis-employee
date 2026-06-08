import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Info,
  SearchX,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import {
  acknowledgeAttendanceAutomationAlertAction,
  clearAttendanceAutomationAlertAcknowledgementAction,
} from "../server/attendance-automation-alert-acknowledgement-actions";
import type { AttendanceAutomationAlertViewItem } from "../types/attendance-automation-alert-acknowledgement-types";
import type { AttendanceAutomationAlertSeverity } from "../types/attendance-automation-alert-types";

type AttendanceAutomationAlertListProps = {
  alerts:
    AttendanceAutomationAlertViewItem[];

  emptyTitle?: string;
  emptyDescription?: string;
  filtered?: boolean;
};

function severityContainerClass(
  severity:
    AttendanceAutomationAlertSeverity,
): string {
  switch (severity) {
    case "CRITICAL":
      return "border-red-200 bg-red-50";

    case "WARNING":
      return "border-amber-200 bg-amber-50";

    case "INFO":
      return "border-blue-200 bg-blue-50";
  }
}

function severityTextClass(
  severity:
    AttendanceAutomationAlertSeverity,
): string {
  switch (severity) {
    case "CRITICAL":
      return "text-red-800";

    case "WARNING":
      return "text-amber-800";

    case "INFO":
      return "text-blue-800";
  }
}

function AlertSeverityIcon({
  severity,
}: {
  severity:
    AttendanceAutomationAlertSeverity;
}) {
  const className =
    "mt-0.5 h-6 w-6 shrink-0";

  switch (severity) {
    case "CRITICAL":
      return (
        <AlertCircle
          className={`${className} text-red-700`}
          aria-hidden="true"
        />
      );

    case "WARNING":
      return (
        <TriangleAlert
          className={`${className} text-amber-700`}
          aria-hidden="true"
        />
      );

    case "INFO":
      return (
        <Info
          className={`${className} text-blue-700`}
          aria-hidden="true"
        />
      );
  }
}

function AlertAcknowledgement({
  alert,
}: {
  alert:
    AttendanceAutomationAlertViewItem;
}) {
  const acknowledgement =
    alert.acknowledgement;

  if (acknowledgement) {
    return (
      <section className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="font-extrabold text-green-800">
                  Alert acknowledged
                </h4>

                <p className="mt-1 text-sm font-semibold leading-6 text-green-700">
                  Acknowledged by user #
                  {acknowledgement.actorUserId ??
                    "SYSTEM"}{" "}
                  until{" "}
                  {
                    acknowledgement
                      .acknowledgedUntil
                  }
                  .
                </p>
              </div>

              <span className="starland-badge starland-badge-success">
                <Clock3
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                {
                  acknowledgement
                    .remainingMinutes
                }{" "}
                min remaining
              </span>
            </div>

            {acknowledgement.note ? (
              <p className="mt-3 rounded-xl border border-green-200 bg-white/70 px-3 py-2 text-sm font-semibold text-green-800">
                Note:{" "}
                {acknowledgement.note}
              </p>
            ) : null}

            <p className="mt-3 text-xs font-bold text-green-700">
              Acknowledged:{" "}
              {
                acknowledgement
                  .acknowledgedAt
              }
            </p>

            <form
              action={
                clearAttendanceAutomationAlertAcknowledgementAction
              }
              className="mt-4"
            >
              <input
                type="hidden"
                name="alertCode"
                value={alert.code}
              />

              <button
                type="submit"
                className="starland-btn starland-btn-soft starland-btn-sm"
              >
                <XCircle
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Clear Acknowledgement
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-[var(--starland-border)] bg-white/70 p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2
          className="h-5 w-5 text-[var(--starland-main-green)]"
          aria-hidden="true"
        />

        <h4 className="font-extrabold text-[var(--starland-dark-text)]">
          Acknowledge this alert
        </h4>
      </div>

      <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
        The alert remains active, but it will be
        marked as reviewed until the selected
        acknowledgement expires.
      </p>

      <form
        action={
          acknowledgeAttendanceAutomationAlertAction
        }
        className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto]"
      >
        <input
          type="hidden"
          name="alertCode"
          value={alert.code}
        />

        <div>
          <label
            htmlFor={`note-${alert.code}`}
            className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]"
          >
            Optional Note
          </label>

          <input
            id={`note-${alert.code}`}
            name="note"
            type="text"
            maxLength={300}
            className="starland-input mt-2"
            placeholder="Example: HR is reviewing the scheduler."
          />
        </div>

        <div>
          <label
            htmlFor={`duration-${alert.code}`}
            className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]"
          >
            Duration
          </label>

          <select
            id={`duration-${alert.code}`}
            name="durationHours"
            defaultValue="8"
            className="starland-input mt-2"
          >
            <option value="1">
              1 hour
            </option>

            <option value="4">
              4 hours
            </option>

            <option value="8">
              8 hours
            </option>

            <option value="24">
              24 hours
            </option>

            <option value="72">
              72 hours
            </option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="starland-btn starland-btn-primary w-full lg:w-auto"
          >
            <CheckCircle2
              className="h-4 w-4"
              aria-hidden="true"
            />

            Acknowledge
          </button>
        </div>
      </form>
    </section>
  );
}

function AlertCard({
  alert,
}: {
  alert:
    AttendanceAutomationAlertViewItem;
}) {
  return (
    <article
      className={[
        "rounded-2xl border p-5",
        severityContainerClass(
          alert.severity,
        ),
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <AlertSeverityIcon
          severity={alert.severity}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span
                className={[
                  "text-xs font-extrabold uppercase tracking-wide",
                  severityTextClass(
                    alert.severity,
                  ),
                ].join(" ")}
              >
                {alert.severity}
              </span>

              <h3
                className={[
                  "mt-1 text-lg font-extrabold",
                  severityTextClass(
                    alert.severity,
                  ),
                ].join(" ")}
              >
                {alert.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {alert.acknowledgement ? (
                <span className="starland-badge starland-badge-success">
                  ACKNOWLEDGED
                </span>
              ) : (
                <span className="starland-badge starland-badge-warning">
                  NEEDS REVIEW
                </span>
              )}

              <code
                className={[
                  "break-all text-xs font-bold",
                  severityTextClass(
                    alert.severity,
                  ),
                ].join(" ")}
              >
                {alert.code}
              </code>
            </div>
          </div>

          <p
            className={[
              "mt-3 text-sm font-semibold leading-6",
              severityTextClass(
                alert.severity,
              ),
            ].join(" ")}
          >
            {alert.message}
          </p>

          {alert.details.length > 0 ? (
            <ul
              className={[
                "mt-4 space-y-2 text-sm font-semibold",
                severityTextClass(
                  alert.severity,
                ),
              ].join(" ")}
            >
              {alert.details.map(
                (detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                    />

                    <span>{detail}</span>
                  </li>
                ),
              )}
            </ul>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={[
                "text-xs font-bold",
                severityTextClass(
                  alert.severity,
                ),
              ].join(" ")}
            >
              Detected: {alert.detectedAt}
            </p>

            {alert.action ? (
              <Link
                href={alert.action.href}
                className="starland-btn starland-btn-soft starland-btn-sm"
              >
                {alert.action.label}

                <ArrowUpRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            ) : null}
          </div>

          <AlertAcknowledgement
            alert={alert}
          />
        </div>
      </div>
    </article>
  );
}

export function AttendanceAutomationAlertList({
  alerts,
  emptyTitle,
  emptyDescription,
  filtered = false,
}: AttendanceAutomationAlertListProps) {
  if (alerts.length === 0) {
    const EmptyIcon = filtered
      ? SearchX
      : CheckCircle2;

    const containerClass = filtered
      ? "border-blue-200 bg-blue-50"
      : "border-green-200 bg-green-50";

    const textClass = filtered
      ? "text-blue-800"
      : "text-green-800";

    const iconClass = filtered
      ? "text-blue-700"
      : "text-green-700";

    return (
      <section
        className={[
          "rounded-2xl border p-6 text-center",
          containerClass,
        ].join(" ")}
      >
        <EmptyIcon
          className={[
            "mx-auto h-10 w-10",
            iconClass,
          ].join(" ")}
          aria-hidden="true"
        />

        <h2
          className={[
            "mt-4 text-xl font-extrabold",
            textClass,
          ].join(" ")}
        >
          {emptyTitle ??
            "No active automation alerts"}
        </h2>

        <p
          className={[
            "mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6",
            textClass,
          ].join(" ")}
        >
          {emptyDescription ??
            "The attendance automation currently has no warning or critical conditions."}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.code}
          alert={alert}
        />
      ))}
    </section>
  );
}