"use client";

import { useActionState } from "react";
import { Loader2, PlayCircle } from "lucide-react";
import { runMissingTimeoutAutomationAction } from "../server/attendance-automation-actions";
import { initialAttendanceAutomationActionState } from "../types/attendance-automation-action-types";

type AttendanceAutomationRunnerProps = {
  batchLimit: number;
  eligibleMissingTimeouts: number;
};

export function AttendanceAutomationRunner({
  batchLimit,
  eligibleMissingTimeouts,
}: AttendanceAutomationRunnerProps) {
  const [state, formAction, isPending] = useActionState(
    runMissingTimeoutAutomationAction,
    initialAttendanceAutomationActionState,
  );

  return (
    <section className="starland-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="starland-badge starland-badge-warning">
            Manual Automation Run
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Run Missing Timeout Automation Now
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            This manually runs the same process as the cron job. It marks old
            time-in records without time-out as MISSING_TIMEOUT. It does not
            make normal records manual and does not expose the cron secret.
          </p>
        </div>

        <form action={formAction}>
          <input type="hidden" name="limit" value={batchLimit} />

          <button
            type="submit"
            className="starland-btn starland-btn-primary"
            disabled={isPending || eligibleMissingTimeouts === 0}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
            )}
            Run Now
          </button>
        </form>
      </div>

      {eligibleMissingTimeouts === 0 ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          No eligible missing timeout records right now.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
          {eligibleMissingTimeouts} eligible record(s) can be processed. Batch
          limit: {batchLimit}.
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