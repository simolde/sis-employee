"use client";

import { useActionState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { recalculateAttendanceStatusAction } from "../server/attendance-status-recalculation-actions";
import { initialAttendanceStatusRecalculationActionState } from "../types/attendance-status-recalculation-types";

type AttendanceStatusRecalculationRunnerProps = {
  batchLimit: number;
  eligibleCount: number;
};

export function AttendanceStatusRecalculationRunner({
  batchLimit,
  eligibleCount,
}: AttendanceStatusRecalculationRunnerProps) {
  const [state, formAction, isPending] = useActionState(
    recalculateAttendanceStatusAction,
    initialAttendanceStatusRecalculationActionState,
  );

  return (
    <section className="starland-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="starland-badge starland-badge-warning">
            Batch Recalculation
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Recalculate Normal Attendance Status
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            This recalculates normal RFID, biometric, and ODL attendance records
            using the assigned schedule and shift. Manual records are skipped so
            HR review decisions are not overwritten.
          </p>
        </div>

        <form action={formAction}>
          <input type="hidden" name="limit" value={batchLimit} />

          <button
            type="submit"
            className="starland-btn starland-btn-primary"
            disabled={isPending || eligibleCount === 0}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            Recalculate Now
          </button>
        </form>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
        Eligible normal records with schedule: {eligibleCount}. Batch limit:{" "}
        {batchLimit}.
      </div>

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