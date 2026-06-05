"use client";

import { useActionState } from "react";
import {
  CalendarCheck,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { rollbackStaleExcusedRecordsAction } from "../server/excused-reconciliation-actions";
import {
  initialExcusedReconciliationActionState,
  type ExcusedReconciliationFilters,
  type ExcusedReconciliationResult,
} from "../types/excused-reconciliation-types";

type ExcusedReconciliationPanelProps = {
  result: ExcusedReconciliationResult;
  limit: number;
};

function HiddenFilters({
  filters,
}: {
  filters: ExcusedReconciliationFilters;
}) {
  return (
    <>
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="branchId" value={filters.branchId} />
      <input
        type="hidden"
        name="departmentId"
        value={filters.departmentId}
      />
      <input type="hidden" name="scheduleId" value={filters.scheduleId} />
      <input type="hidden" name="dateFrom" value={filters.dateFrom} />
      <input type="hidden" name="dateTo" value={filters.dateTo} />
    </>
  );
}

export function ExcusedReconciliationPanel({
  result,
  limit,
}: ExcusedReconciliationPanelProps) {
  const [state, formAction, isPending] = useActionState(
    rollbackStaleExcusedRecordsAction,
    initialExcusedReconciliationActionState,
  );

  const rollbackCount = Math.min(
    result.summary.rollbackEligible,
    limit,
  );

  return (
    <section className="starland-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="starland-badge starland-badge-warning">
            EXCUSED Reconciliation
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Rollback Unsupported Automatic EXCUSED Records
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Only automatic EXCUSED records without punch data, without approved
            leave coverage, and with a verified automatic-generation activity
            log can be deleted.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Up to {rollbackCount} of {result.summary.rollbackEligible} eligible
          record(s) can be rolled back.
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <RotateCcw className="h-6 w-6 text-[var(--starland-warning)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Rollback Eligible
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {result.summary.rollbackEligible}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <CalendarCheck className="h-6 w-6 text-[var(--starland-success)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Protected by Leave
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {result.summary.protectedByApprovedLeave}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <ShieldAlert className="h-6 w-6 text-[var(--starland-danger)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Missing Provenance
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {result.summary.missingGenerationProvenance}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <ShieldAlert className="h-6 w-6 text-[var(--starland-info)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Maximum Per Run
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {limit}
          </p>
        </article>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <HiddenFilters filters={result.filters} />

        <input type="hidden" name="limit" value={limit} />

        <label className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          <input
            name="confirmRollback"
            type="checkbox"
            className="mt-1"
          />

          <span>
            I reviewed the stale EXCUSED records. I understand eligible records
            will be deleted only after approved leave and generation provenance
            are checked again inside the database transaction.
          </span>
        </label>

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={isPending || result.summary.rollbackEligible === 0}
        >
          {isPending ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          )}

          Rollback Stale EXCUSED Records
        </button>
      </form>

      {state.message ? (
        <div
          aria-live="polite"
          className={[
            "mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
            state.ok
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {state.message}

          {state.ok ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Checked: {state.checkedCount ?? 0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Rolled back: {state.rolledBackCount ?? 0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Leave protected: {state.protectedByLeaveCount ?? 0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Missing provenance: {state.missingProvenanceCount ?? 0}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}