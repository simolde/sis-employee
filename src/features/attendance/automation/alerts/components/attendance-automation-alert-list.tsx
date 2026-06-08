import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Info,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationAlertItem,
  AttendanceAutomationAlertSeverity,
} from "../types/attendance-automation-alert-types";

type AttendanceAutomationAlertListProps = {
  alerts: AttendanceAutomationAlertItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  filtered?: boolean;
};

function severityContainerClass(
  severity: AttendanceAutomationAlertSeverity,
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
  severity: AttendanceAutomationAlertSeverity,
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
  severity: AttendanceAutomationAlertSeverity;
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

function AlertCard({
  alert,
}: {
  alert: AttendanceAutomationAlertItem;
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