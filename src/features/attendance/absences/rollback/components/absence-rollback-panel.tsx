"use client";

import { useActionState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { rollbackGeneratedAbsentRecordsAction } from "../server/absence-rollback-actions";
import {
  initialAbsenceRollbackActionState,
  type AbsenceRollbackFilters,
  type AbsenceRollbackResult,
} from "../types/absence-rollback-types";

type AbsenceRollbackPanelProps = {
  result: AbsenceRollbackResult;
  limit: number;
};

function HiddenFilters({ filters }: { filters: AbsenceRollbackFilters }) {
  return (
    <>
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="branchId" value={filters.branchId} />
      <input type="hidden" name="departmentId" value={filters.departmentId} />
      <input type="hidden" name="scheduleId" value={filters.scheduleId} />
      <input type="hidden" name="dateFrom" value={filters.dateFrom} />
      <input type="hidden" name="dateTo" value={filters.dateTo} />
    </>
  );
}

export function AbsenceRollbackPanel({
  result,
  limit,
}: AbsenceRollbackPanelProps) {
  const [state, formAction, isPending] = useActionState(
    rollbackGeneratedAbsentRecordsAction,
    initialAbsenceRollbackActionState,
  );

  const rollbackCount = Math.min(
    result.summary.rollbackEligibleRecords,
    limit,
  );

  return (
    <section className="starland-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="starland-badge starland-badge-danger">
            Rollback ABSENT
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Rollback Eligible Automatic ABSENT Records
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            This deletes only automatic ABSENT records with no time-in and no
            time-out. Manual ABSENT records and punched records are protected.
            Maximum rollback per run: {limit}.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Will rollback up to {rollbackCount} of{" "}
          {result.summary.rollbackEligibleRecords} eligible record(s).
        </div>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <HiddenFilters filters={result.filters} />
        <input type="hidden" name="limit" value={limit} />

        <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          <input name="confirmRollback" type="checkbox" className="mt-1" />
          <span>
            I understand this will delete eligible automatic ABSENT records from
            the selected filters, after creating rollback activity logs.
          </span>
        </label>

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={isPending || result.summary.rollbackEligibleRecords === 0}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          )}
          Rollback ABSENT Records
        </button>
      </form>

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