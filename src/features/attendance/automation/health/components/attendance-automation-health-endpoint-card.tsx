import {
  Activity,
  CheckCircle2,
  HeartPulse,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import type { AttendanceAutomationHealthData } from "../types/attendance-automation-health-types";

type AttendanceAutomationHealthEndpointCardProps = {
  data: AttendanceAutomationHealthData;
};

function strictStatusCode(
  status: AttendanceAutomationHealthData["status"],
): number {
  return status === "HEALTHY"
    ? 200
    : 503;
}

function operationalStatusCode(
  status: AttendanceAutomationHealthData["status"],
): number {
  return status === "HEALTHY" ||
    status === "DEGRADED"
    ? 200
    : 503;
}

export function AttendanceAutomationHealthEndpointCard({
  data,
}: AttendanceAutomationHealthEndpointCardProps) {
  const strictCode =
    strictStatusCode(data.status);

  const operationalCode =
    operationalStatusCode(data.status);

  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <HeartPulse
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Protected Health Endpoint
          </h2>
        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          External monitoring can use strict mode
          for admin review or operational mode for
          scheduler uptime checks.
        </p>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <Activity
            className="h-6 w-6 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Strict Endpoint
          </p>

          <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-xl border border-[var(--starland-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--starland-dark-text)]">
            GET
            /api/automation/attendance/health?mode=strict
          </code>

          <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
            Returns 503 for DEGRADED, STALE,
            NO_RUNS, and NOT_CONFIGURED.
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <CheckCircle2
            className="h-6 w-6 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Operational Endpoint
          </p>

          <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-xl border border-[var(--starland-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--starland-dark-text)]">
            GET
            /api/automation/attendance/health?mode=operational
          </code>

          <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
            Returns 200 for HEALTHY and DEGRADED,
            but 503 for STALE, NO_RUNS, and
            NOT_CONFIGURED.
          </p>
        </article>

        <article
          className={[
            "rounded-2xl border p-4",
            strictCode === 200
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          {strictCode === 200 ? (
            <CheckCircle2
              className="h-6 w-6 text-green-700"
              aria-hidden="true"
            />
          ) : (
            <TriangleAlert
              className="h-6 w-6 text-amber-700"
              aria-hidden="true"
            />
          )}

          <p
            className={[
              "mt-3 text-sm font-bold",
              strictCode === 200
                ? "text-green-700"
                : "text-amber-700",
            ].join(" ")}
          >
            Current Result
          </p>

          <p
            className={[
              "mt-2 text-2xl font-extrabold",
              strictCode === 200
                ? "text-green-800"
                : "text-amber-800",
            ].join(" ")}
          >
            Strict HTTP {strictCode}
          </p>

          <p
            className={[
              "mt-2 text-sm font-extrabold",
              operationalCode === 200
                ? "text-green-700"
                : "text-amber-700",
            ].join(" ")}
          >
            Operational HTTP {operationalCode}
          </p>

          <div className="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-[var(--starland-muted-text)]">
            <ShieldAlert
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />

            <p>
              Use strict mode for admin dashboards.
              Use operational mode when a late
              completed run should be warning-level
              instead of downtime.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}