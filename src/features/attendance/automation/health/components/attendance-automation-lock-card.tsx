import {
  CheckCircle2,
  CircleAlert,
  Database,
  LockKeyhole,
  Network,
  RotateCw,
  ServerCog,
} from "lucide-react";
import type { AttendanceAutomationLockHealthData } from "../types/attendance-automation-lock-health-types";

type AttendanceAutomationLockCardProps = {
  data: AttendanceAutomationLockHealthData;
};

function LockStatusIcon({
  status,
}: {
  status:
    AttendanceAutomationLockHealthData["status"];
}) {
  if (status === "RUNNING") {
    return (
      <RotateCw
        className="h-7 w-7 animate-spin text-amber-700"
        aria-hidden="true"
      />
    );
  }

  if (status === "UNAVAILABLE") {
    return (
      <CircleAlert
        className="h-7 w-7 text-red-700"
        aria-hidden="true"
      />
    );
  }

  return (
    <CheckCircle2
      className="h-7 w-7 text-green-700"
      aria-hidden="true"
    />
  );
}

function statusContainerClass(
  status:
    AttendanceAutomationLockHealthData["status"],
): string {
  switch (status) {
    case "RUNNING":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "UNAVAILABLE":
      return "border-red-200 bg-red-50 text-red-800";

    case "AVAILABLE":
      return "border-green-200 bg-green-50 text-green-800";
  }
}

export function AttendanceAutomationLockCard({
  data,
}: AttendanceAutomationLockCardProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <LockKeyhole
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Distributed Automation Lock
          </h2>
        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          The shared MySQL lock prevents separate
          Node.js application processes from running
          approved-leave automation simultaneously.
        </p>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1.2fr_2fr]">
        <article
          className={[
            "rounded-2xl border p-5",
            statusContainerClass(
              data.status,
            ),
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <LockStatusIcon
              status={data.status}
            />

            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">
                Current Lock Status
              </p>

              <h3 className="mt-1 text-xl font-extrabold">
                {data.statusLabel}
              </h3>

              <p className="mt-2 text-sm font-semibold leading-6">
                {data.statusDescription}
              </p>

              {data.retryAfterSeconds !==
              null ? (
                <p className="mt-3 text-xs font-extrabold">
                  Recommended retry: approximately{" "}
                  {data.retryAfterSeconds} seconds
                </p>
              ) : null}
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Database
              className="h-6 w-6 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Lock Provider
            </p>

            <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
              MySQL Named Lock
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              {data.source}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Network
              className="h-6 w-6 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Coordination Scope
            </p>

            <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
              Database Server
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              Shared by application processes using
              the same MySQL server.
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ServerCog
              className="h-6 w-6 text-[var(--starland-warning)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Owner Connection
            </p>

            <p className="mt-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {data.ownerConnectionId !== null
                ? `#${data.ownerConnectionId}`
                : data.status === "UNAVAILABLE"
                  ? "Unknown"
                  : "No owner"}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <LockKeyhole
              className="h-6 w-6 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Lock Name
            </p>

            <p className="mt-2 break-all text-sm font-extrabold text-[var(--starland-dark-text)]">
              {data.lockName}
            </p>
          </article>
        </div>
      </div>

      <div className="border-t border-blue-200 bg-blue-50 px-5 py-4 text-sm font-semibold leading-6 text-blue-800">
        The lock is released when automation
        completes, fails, or the owning MySQL
        session closes. Redis is not required for
        this coordination strategy.
      </div>
    </section>
  );
}