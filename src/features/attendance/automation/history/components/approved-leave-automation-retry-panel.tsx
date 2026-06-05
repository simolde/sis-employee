"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { retryApprovedLeaveAutomationAction } from "../server/approved-leave-automation-retry-actions";
import {
  initialApprovedLeaveAutomationRetryActionState,
} from "../types/approved-leave-automation-retry-types";

type ApprovedLeaveAutomationRetryPanelProps = {
  activityLogId: number;
  status:
    | "COMPLETED"
    | "FAILED"
    | "UNKNOWN";
};

export function ApprovedLeaveAutomationRetryPanel({
  activityLogId,
  status,
}: ApprovedLeaveAutomationRetryPanelProps) {
  const [state, formAction, isPending] =
    useActionState(
      retryApprovedLeaveAutomationAction,
      initialApprovedLeaveAutomationRetryActionState,
    );

  if (status !== "FAILED") {
    return null;
  }

  return (
    <section className="starland-card border-red-200 p-5 print:hidden">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50">
          <RotateCcw
            className="h-5 w-5 text-red-700"
            aria-hidden="true"
          />
        </div>

        <div>
          <span className="starland-badge starland-badge-danger">
            Failed Run Recovery
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Retry Using the Original Settings
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            The retry uses the original attendance
            range, employee search, branch,
            department, and processing limit.
            Existing attendance remains protected,
            making the retry idempotent.
          </p>
        </div>
      </div>

      <form
        action={formAction}
        className="mt-5 space-y-4"
      >
        <input
          type="hidden"
          name="originalRunAuditLogId"
          value={activityLogId}
        />

        <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          <input
            name="confirmRetry"
            type="checkbox"
            className="mt-1"
          />

          <span>
            I reviewed the failure information and
            want to retry this automation using the
            original run settings.
          </span>
        </label>

        {state.fieldErrors
          ?.confirmRetry ? (
          <p className="text-xs font-semibold text-red-600">
            {
              state.fieldErrors
                .confirmRetry[0]
            }
          </p>
        ) : null}

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <RotateCcw
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          Retry Failed Run
        </button>
      </form>

      {state.message ? (
        <div
          aria-live="polite"
          className={[
            "mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold",
            state.ok
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          <div className="flex items-start gap-2">
            {state.ok ? (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <TriangleAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
            )}

            <p>{state.message}</p>
          </div>

          {state.runAuditLogId ? (
            <Link
              href={`/dashboard/attendance/automation/approved-leave-excused/history/${state.runAuditLogId}`}
              className="starland-btn starland-btn-soft starland-btn-sm mt-4"
            >
              Open New Run #
              {state.runAuditLogId}
            </Link>
          ) : null}

          {state.ok ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Checked:{" "}
                {state.checkedCount ?? 0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Generated:{" "}
                {state.generatedCount ?? 0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Existing:{" "}
                {state.existingAttendanceCount ??
                  0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Exceptions:{" "}
                {state.exceptionProtectedCount ??
                  0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Not scheduled:{" "}
                {state.notScheduledCount ?? 0}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}