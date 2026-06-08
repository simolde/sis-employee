import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationAlertCenterData,
  AttendanceAutomationAlertOverallStatus,
} from "../types/attendance-automation-alert-types";

type AttendanceAutomationAlertSummaryProps = {
  data: AttendanceAutomationAlertCenterData;
};

function statusContainerClass(
  status: AttendanceAutomationAlertOverallStatus,
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

function OverallStatusIcon({
  status,
}: {
  status: AttendanceAutomationAlertOverallStatus;
}) {
  const className =
    "h-8 w-8 shrink-0";

  switch (status) {
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

    case "CRITICAL":
      return (
        <AlertCircle
          className={className}
          aria-hidden="true"
        />
      );
  }
}

export function AttendanceAutomationAlertSummary({
  data,
}: AttendanceAutomationAlertSummaryProps) {
  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          statusContainerClass(
            data.overallStatus,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <OverallStatusIcon
            status={data.overallStatus}
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Automation Alert Status
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {data.overallLabel}
            </h2>

            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6">
              {data.overallDescription}
            </p>

            <p className="mt-3 text-xs font-bold">
              Last evaluated:{" "}
              {data.generatedAt}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <BellRing
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Active Alerts
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalAlerts}
          </p>
        </article>

        <article className="starland-card p-4">
          <AlertCircle
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Critical
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.criticalAlerts}
          </p>
        </article>

        <article className="starland-card p-4">
          <TriangleAlert
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Warnings
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.warningAlerts}
          </p>
        </article>

        <article className="starland-card p-4">
          <Info
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Information
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .informationalAlerts
            }
          </p>
        </article>
      </section>
    </div>
  );
}