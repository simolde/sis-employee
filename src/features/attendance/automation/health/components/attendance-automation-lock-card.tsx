import {
  CheckCircle2,
  Clock3,
  LockKeyhole,
  PlayCircle,
  RotateCw,
} from "lucide-react";
import type { AttendanceAutomationLockHealthData } from "../types/attendance-automation-lock-health-types";

type AttendanceAutomationLockCardProps = {
  data: AttendanceAutomationLockHealthData;
};

function LockStatusIcon({
  active,
}: {
  active: boolean;
}) {
  if (active) {
    return (
      <RotateCw
        className="h-7 w-7 animate-spin text-amber-700"
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
            Automation Execution Lock
          </h2>
        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          The application lock prevents API,
          dashboard, and retry executions from
          processing approved-leave automation at
          the same time.
        </p>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1.2fr_2fr]">
        <article
          className={[
            "rounded-2xl border p-5",
            data.active
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-green-200 bg-green-50 text-green-800",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <LockStatusIcon
              active={data.active}
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
                  {data.retryAfterSeconds} second(s)
                </p>
              ) : null}
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <PlayCircle
              className="h-6 w-6 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Acquired At
            </p>

            <p className="mt-2 text-sm font-extrabold text-[var(--starland-dark-text)]">
              {data.acquiredAt ??
                "No active lock"}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3
              className="h-6 w-6 text-[var(--starland-warning)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Automatic Expiration
            </p>

            <p className="mt-2 text-sm font-extrabold text-[var(--starland-dark-text)]">
              {data.expiresAt ??
                "Not applicable"}
            </p>
          </article>
        </div>
      </div>

      <div className="border-t border-blue-200 bg-blue-50 px-5 py-4 text-sm font-semibold leading-6 text-blue-800">
        This is a single-process application lock.
        Multiple Node.js servers require a shared
        database or Redis-backed distributed lock.
      </div>
    </section>
  );
}