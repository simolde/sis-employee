"use client";

import { useActionState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  Play,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { runApprovedLeaveExcusedAutomationAction } from "../server/approved-leave-excused-automation-actions";
import {
  initialApprovedLeaveExcusedAutomationActionState,
} from "../types/approved-leave-excused-automation-types";
import type { ApprovedLeaveExcusedSyncResult } from "@/features/attendance/excused/sync/types/approved-leave-excused-sync-types";

type ApprovedLeaveExcusedAutomationPanelProps = {
  result: ApprovedLeaveExcusedSyncResult;
  secretConfigured: boolean;
  maximumRecords: number;
};

export function ApprovedLeaveExcusedAutomationPanel({
  result,
  secretConfigured,
  maximumRecords,
}: ApprovedLeaveExcusedAutomationPanelProps) {
  const [state, formAction, isPending] =
    useActionState(
      runApprovedLeaveExcusedAutomationAction,
      initialApprovedLeaveExcusedAutomationActionState,
    );

  const candidateCount =
    result.summary
      .missingExcusedCandidates;

  return (
    <section className="starland-card p-5 print:hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Manual Automation Run
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Run Approved-Leave EXCUSED
            Automation
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            This dashboard action uses the same
            synchronization service as the
            protected automation endpoint. The
            current user is recorded as the audit
            actor.
          </p>
        </div>

        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-semibold",
            secretConfigured
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-800",
          ].join(" ")}
        >
          <div className="flex items-center gap-2">
            <KeyRound
              className="h-4 w-4"
              aria-hidden="true"
            />

            Automation endpoint:{" "}
            {secretConfigured
              ? "Configured"
              : "Secret not configured"}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <CalendarCheck className="h-6 w-6 text-[var(--starland-success)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Missing EXCUSED
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {candidateCount}
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
          <TriangleAlert className="h-6 w-6 text-[var(--starland-warning)]" />

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
          <Play className="h-6 w-6 text-[var(--starland-main-green)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Maximum Per Run
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {maximumRecords}
          </p>
        </article>
      </div>

      <form
        action={formAction}
        className="mt-5 space-y-4"
      >
        <input
          type="hidden"
          name="q"
          value={result.filters.q}
        />

        <input
          type="hidden"
          name="branchId"
          value={result.filters.branchId}
        />

        <input
          type="hidden"
          name="departmentId"
          value={
            result.filters.departmentId
          }
        />

        <input
          type="hidden"
          name="dateFrom"
          value={result.filters.dateFrom}
        />

        <input
          type="hidden"
          name="dateTo"
          value={result.filters.dateTo}
        />

        <div className="max-w-xs">
          <label
            htmlFor="automationLimit"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Maximum Records
          </label>

          <input
            id="automationLimit"
            name="limit"
            type="number"
            min={1}
            max={maximumRecords}
            defaultValue={maximumRecords}
            className="starland-input mt-2"
          />

          {state.fieldErrors?.limit ? (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {
                state.fieldErrors.limit[0]
              }
            </p>
          ) : null}
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          <input
            name="confirmRun"
            type="checkbox"
            className="mt-1"
          />

          <span>
            I reviewed the preview and understand
            that the system will recheck approved
            leave, employee schedules, attendance
            exceptions, and existing attendance
            before creating each EXCUSED record.
          </span>
        </label>

        {state.fieldErrors?.confirmRun ? (
          <p className="text-xs font-semibold text-red-600">
            {
              state.fieldErrors
                .confirmRun[0]
            }
          </p>
        ) : null}

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={
            isPending ||
            candidateCount === 0
          }
        >
          {isPending ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Play
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          Run Approved-Leave Automation
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

          {state.ok ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
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

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Leave changed:{" "}
                {state.noApprovedLeaveCount ??
                  0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Skipped:{" "}
                {state.skippedCount ?? 0}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
        <p className="text-sm font-bold text-[var(--starland-dark-text)]">
          Protected endpoint
        </p>

        <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs text-[var(--starland-dark-text)]">
          POST
          /api/automation/attendance/approved-leave-excused
        </code>

        <p className="mt-2 text-xs leading-5 text-[var(--starland-muted-text)]">
          External automation requests must include
          the configured bearer token or attendance
          automation secret header.
        </p>
      </div>
    </section>
  );
}