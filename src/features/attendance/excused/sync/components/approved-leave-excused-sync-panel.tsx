"use client";

import { useActionState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { syncApprovedLeaveExcusedRecordsAction } from "../server/approved-leave-excused-sync-actions";
import {
  initialApprovedLeaveExcusedSyncActionState,
  type ApprovedLeaveExcusedSyncFilters,
  type ApprovedLeaveExcusedSyncResult,
} from "../types/approved-leave-excused-sync-types";

type ApprovedLeaveExcusedSyncPanelProps = {
  result: ApprovedLeaveExcusedSyncResult;
  limit: number;
};

function HiddenFilters({
  filters,
}: {
  filters: ApprovedLeaveExcusedSyncFilters;
}) {
  return (
    <>
      <input
        type="hidden"
        name="q"
        value={filters.q}
      />

      <input
        type="hidden"
        name="branchId"
        value={filters.branchId}
      />

      <input
        type="hidden"
        name="departmentId"
        value={filters.departmentId}
      />

      <input
        type="hidden"
        name="dateFrom"
        value={filters.dateFrom}
      />

      <input
        type="hidden"
        name="dateTo"
        value={filters.dateTo}
      />
    </>
  );
}

export function ApprovedLeaveExcusedSyncPanel({
  result,
  limit,
}: ApprovedLeaveExcusedSyncPanelProps) {
  const [state, formAction, isPending] =
    useActionState(
      syncApprovedLeaveExcusedRecordsAction,
      initialApprovedLeaveExcusedSyncActionState,
    );

  const processableCount = Math.min(
    result.summary
      .missingExcusedCandidates,
    limit,
  );

  return (
    <section className="starland-card p-5 print:hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Approved-Leave Sync
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Generate Missing EXCUSED Records
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            The server rechecks the employee
            schedule, approved leave, existing
            attendance, and attendance exception
            calendar before creating each EXCUSED
            record.
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          Up to {processableCount} of{" "}
          {
            result.summary
              .missingExcusedCandidates
          }{" "}
          candidate(s) will be processed.
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <CalendarCheck className="h-6 w-6 text-[var(--starland-success)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Missing EXCUSED
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              result.summary
                .missingExcusedCandidates
            }
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <ShieldCheck className="h-6 w-6 text-[var(--starland-info)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Existing Attendance
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              result.summary
                .alreadyHasAttendance
            }
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <CalendarDays className="h-6 w-6 text-[var(--starland-warning)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Exception Protected
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {
              result.summary
                .exceptionProtected
            }
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <ClipboardCheck className="h-6 w-6 text-[var(--starland-main-green)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Maximum Per Run
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {limit}
          </p>
        </article>
      </div>

      <form
        action={formAction}
        className="mt-5 space-y-4"
      >
        <HiddenFilters
          filters={result.filters}
        />

        <input
          type="hidden"
          name="limit"
          value={limit}
        />

        <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          <input
            name="confirmSync"
            type="checkbox"
            className="mt-1"
          />

          <span>
            I reviewed the candidates. I
            understand that existing attendance
            will never be overwritten and that the
            system will recheck approved leave,
            schedule days, and exception dates.
          </span>
        </label>

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={
            isPending ||
            result.summary
              .missingExcusedCandidates === 0
          }
        >
          {isPending ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          Generate Missing EXCUSED
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
                Checked:{" "}
                {state.checkedCount ?? 0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Generated:{" "}
                {state.generatedCount ?? 0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Existing attendance:{" "}
                {state.existingAttendanceCount ??
                  0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Exception protected:{" "}
                {state.exceptionProtectedCount ??
                  0}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}