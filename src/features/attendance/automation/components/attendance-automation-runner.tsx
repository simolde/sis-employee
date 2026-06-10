"use client";

import {
  useActionState,
} from "react";
import {
  Ban,
  Loader2,
  PlayCircle,
  TimerOff,
} from "lucide-react";
import { runMissingTimeoutAutomationAction } from "../server/attendance-automation-actions";
import { initialAttendanceAutomationActionState } from "../types/attendance-automation-action-types";

type AttendanceAutomationRunnerProps = {
  automationEnabled: boolean;
  missingTimeoutMinutes: number;
  batchLimit: number;
  eligibleMissingTimeouts: number;
};

export function AttendanceAutomationRunner({
  automationEnabled,
  missingTimeoutMinutes,
  batchLimit,
  eligibleMissingTimeouts,
}: AttendanceAutomationRunnerProps) {
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    runMissingTimeoutAutomationAction,
    initialAttendanceAutomationActionState,
  );

  const runDisabled =
    isPending ||
    !automationEnabled ||
    eligibleMissingTimeouts === 0;

  return (
    <section className="starland-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span
            className={[
              "starland-badge",

              automationEnabled
                ? "starland-badge-warning"
                : "starland-badge-danger",
            ].join(" ")}
          >
            Manual Automation Run
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Run Missing Time-Out Automation
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            This runs the same policy-controlled
            process used by the missing-time-out cron
            endpoint. Eligible records are marked as
            MISSING_TIMEOUT without converting them
            into manual attendance records.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={[
                "starland-badge",

                automationEnabled
                  ? "starland-badge-success"
                  : "starland-badge-danger",
              ].join(" ")}
            >
              Policy:{" "}
              {automationEnabled
                ? "ENABLED"
                : "DISABLED"}
            </span>

            <span className="starland-badge starland-badge-info">
              Threshold:{" "}
              {missingTimeoutMinutes} minutes
            </span>

            <span className="starland-badge starland-badge-warning">
              Batch limit: {batchLimit}
            </span>
          </div>
        </div>

        <form action={formAction}>
          <input
            type="hidden"
            name="limit"
            value={batchLimit}
          />

          <button
            type="submit"
            className="starland-btn starland-btn-primary"
            disabled={runDisabled}
          >
            {isPending ? (
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : automationEnabled ? (
              <PlayCircle
                className="h-4 w-4"
                aria-hidden="true"
              />
            ) : (
              <Ban
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}

            {isPending
              ? "Running..."
              : "Run Now"}
          </button>
        </form>
      </div>

      {!automationEnabled ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <Ban
              className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-extrabold text-red-800">
                Automation disabled by policy
              </p>

              <p className="mt-1 text-sm font-semibold leading-6 text-red-700">
                Enable Automatically Mark Missing
                Time-Out under Settings → Attendance
                Policies before running this
                automation.
              </p>
            </div>
          </div>
        </div>
      ) : eligibleMissingTimeouts === 0 ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <TimerOff
              className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
              aria-hidden="true"
            />

            <p className="text-sm font-semibold text-green-700">
              No eligible missing time-out records
              currently exceed the{" "}
              {missingTimeoutMinutes}-minute policy
              threshold.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {eligibleMissingTimeouts} eligible
          record(s) can be processed. Each record has
          remained open for at least{" "}
          {missingTimeoutMinutes} minutes.
        </div>
      )}

      {state.message ? (
        <div
          className={[
            "mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold",

            state.ok
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {state.message}
        </div>
      ) : null}
    </section>
  );
}