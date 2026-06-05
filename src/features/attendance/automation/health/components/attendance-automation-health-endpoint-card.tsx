import {
  CheckCircle2,
  CircleAlert,
  KeyRound,
  RadioTower,
  ServerCog,
} from "lucide-react";
import type {
  AttendanceAutomationHealthData,
} from "../types/attendance-automation-health-types";

type AttendanceAutomationHealthEndpointCardProps = {
  data: AttendanceAutomationHealthData;
};

function expectedStatusCode(
  data: AttendanceAutomationHealthData,
): number {
  return data.status === "HEALTHY"
    ? 200
    : 503;
}

export function AttendanceAutomationHealthEndpointCard({
  data,
}: AttendanceAutomationHealthEndpointCardProps) {
  const statusCode =
    expectedStatusCode(data);

  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <RadioTower
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Protected Health Endpoint
          </h2>
        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          External uptime monitors and scheduled
          checks can use this endpoint to verify the
          approved-leave automation state.
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
            /api/automation/attendance/health
          </code>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <KeyRound
            className={[
              "h-6 w-6",
              data.secretConfigured
                ? "text-[var(--starland-success)]"
                : "text-[var(--starland-danger)]",
            ].join(" ")}
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Authentication
          </p>

          <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
            {data.secretConfigured
              ? "Secret configured"
              : "Secret missing"}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--starland-muted-text)]">
            Supports a bearer token or the
            X-Attendance-Automation-Secret header.
          </p>
        </article>

        <article
          className={[
            "rounded-2xl border p-4",
            statusCode === 200
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          {statusCode === 200 ? (
            <CheckCircle2
              className="h-6 w-6 text-green-700"
              aria-hidden="true"
            />
          ) : (
            <CircleAlert
              className="h-6 w-6 text-amber-700"
              aria-hidden="true"
            />
          )}

          <p
            className={[
              "mt-3 text-sm font-bold",
              statusCode === 200
                ? "text-green-700"
                : "text-amber-700",
            ].join(" ")}
          >
            Current HTTP Result
          </p>

          <p
            className={[
              "mt-2 text-2xl font-extrabold",
              statusCode === 200
                ? "text-green-800"
                : "text-amber-800",
            ].join(" ")}
          >
            HTTP {statusCode}
          </p>

          <p
            className={[
              "mt-2 text-xs font-semibold leading-5",
              statusCode === 200
                ? "text-green-700"
                : "text-amber-700",
            ].join(" ")}
          >
            {statusCode === 200
              ? "The automation currently passes the health requirements."
              : "The endpoint will signal that monitoring attention is required."}
          </p>
        </article>
      </div>
    </section>
  );
}