import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RadioTower,
  ServerCog,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationAlertCenterData,
} from "../types/attendance-automation-alert-types";

type AttendanceAutomationAlertEndpointCardProps = {
  data: AttendanceAutomationAlertCenterData;
};

function expectedHttpStatus(
  data: AttendanceAutomationAlertCenterData,
): number {
  return data.overallStatus === "CRITICAL"
    ? 503
    : 200;
}

export function AttendanceAutomationAlertEndpointCard({
  data,
}: AttendanceAutomationAlertEndpointCardProps) {
  const statusCode =
    expectedHttpStatus(data);

  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <RadioTower
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Protected Alert Endpoint
          </h2>
        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          External monitoring services can query
          the current automation alerts without
          accessing the administrator dashboard.
        </p>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <ServerCog
            className="h-6 w-6 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Endpoint
          </p>

          <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-xl border border-[var(--starland-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--starland-dark-text)]">
            GET
            /api/automation/attendance/alerts
          </code>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <KeyRound
            className="h-6 w-6 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Authentication
          </p>

          <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Protected secret
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--starland-muted-text)]">
            Supports Authorization Bearer,
            X-Attendance-Automation-Secret, or
            X-Cron-Secret.
          </p>
        </article>

        <article
          className={[
            "rounded-2xl border p-4",
            statusCode === 200
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50",
          ].join(" ")}
        >
          {statusCode === 200 ? (
            data.overallStatus ===
            "ATTENTION" ? (
              <TriangleAlert
                className="h-6 w-6 text-amber-700"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="h-6 w-6 text-green-700"
                aria-hidden="true"
              />
            )
          ) : (
            <AlertCircle
              className="h-6 w-6 text-red-700"
              aria-hidden="true"
            />
          )}

          <p
            className={[
              "mt-3 text-sm font-bold",
              statusCode === 200
                ? "text-green-700"
                : "text-red-700",
            ].join(" ")}
          >
            Current HTTP Result
          </p>

          <p
            className={[
              "mt-2 text-2xl font-extrabold",
              statusCode === 200
                ? "text-green-800"
                : "text-red-800",
            ].join(" ")}
          >
            HTTP {statusCode}
          </p>

          <p
            className={[
              "mt-2 text-xs font-semibold leading-5",
              statusCode === 200
                ? "text-green-700"
                : "text-red-700",
            ].join(" ")}
          >
            {statusCode === 200
              ? data.overallStatus ===
                "ATTENTION"
                ? "Warnings exist, but no critical automation condition is active."
                : "No critical or warning automation condition is active."
              : "At least one critical automation condition requires attention."}
          </p>
        </article>
      </div>
    </section>
  );
}