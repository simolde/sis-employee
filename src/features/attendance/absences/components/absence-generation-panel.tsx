"use client";

import { useActionState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  Loader2,
  TimerOff,
} from "lucide-react";
import { generateAbsentRecordsAction } from "../server/absence-generation-actions";
import { initialAbsenceGenerationActionState } from "../types/absence-generation-types";
import type {
  AbsenceCandidateFilters,
  AbsenceCandidateResult,
} from "../types/absence-candidate-types";

type AbsenceGenerationPanelProps = {
  result: AbsenceCandidateResult;
  limit: number;
};

function HiddenFilters({
  filters,
}: {
  filters: AbsenceCandidateFilters;
}) {
  return (
    <>
      <input type="hidden" name="date" value={filters.date} />
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="branchId" value={filters.branchId} />
      <input
        type="hidden"
        name="departmentId"
        value={filters.departmentId}
      />
      <input type="hidden" name="scheduleId" value={filters.scheduleId} />
      <input
        type="hidden"
        name="activeOnly"
        value={filters.activeOnly ? "true" : "false"}
      />
    </>
  );
}

export function AbsenceGenerationPanel({
  result,
  limit,
}: AbsenceGenerationPanelProps) {
  const [state, formAction, isPending] = useActionState(
    generateAbsentRecordsAction,
    initialAbsenceGenerationActionState,
  );

  const approvedLeaveCount = result.summary.excludedByApprovedLeave;
  const absentCandidateCount = result.summary.candidateAbsences;

  const excusedGenerationCount = Math.min(approvedLeaveCount, limit);

  const absentGenerationCount = Math.min(
    absentCandidateCount,
    Math.max(0, limit - excusedGenerationCount),
  );

  const totalGenerationCount =
    excusedGenerationCount + absentGenerationCount;

  return (
    <section className="starland-card p-5 print:hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Attendance Generation
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Generate EXCUSED and ABSENT Records
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Approved leave will generate an automatic EXCUSED record. Employees
            without attendance, approved leave, or an active exception will
            generate an automatic ABSENT record.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-4 py-3 text-sm font-semibold text-[var(--starland-dark-text)]">
          Up to {totalGenerationCount} record(s) will be processed in this run.
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <CalendarCheck className="h-6 w-6 text-[var(--starland-success)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Will Generate EXCUSED
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {excusedGenerationCount}
          </p>

          <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
            From approved leave
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <TimerOff className="h-6 w-6 text-[var(--starland-danger)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Will Generate ABSENT
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {absentGenerationCount}
          </p>

          <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
            Remaining eligible employees
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <CalendarDays className="h-6 w-6 text-[var(--starland-info)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Exception Protected
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {result.summary.excludedByException}
          </p>

          <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
            No record generated
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <ClipboardCheck className="h-6 w-6 text-[var(--starland-warning)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Maximum Per Run
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {limit}
          </p>

          <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
            EXCUSED and ABSENT combined
          </p>
        </article>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <HiddenFilters filters={result.filters} />

        <input type="hidden" name="limit" value={limit} />

        <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          <input
            name="confirmGenerate"
            type="checkbox"
            className="mt-1"
          />

          <span>
            I reviewed the preview. I understand approved leave will create
            EXCUSED records, remaining eligible employees will create ABSENT
            records, and the server will recheck all attendance, leave, schedule,
            and exception conditions.
          </span>
        </label>

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={isPending || totalGenerationCount === 0}
        >
          {isPending ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          )}

          Generate Attendance Records
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

          {state.ok && state.generatedCount !== undefined ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                Total generated: {state.generatedCount}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                EXCUSED: {state.generatedExcusedCount ?? 0}
              </div>

              <div className="rounded-xl border border-green-200 bg-white px-3 py-2">
                ABSENT: {state.generatedAbsentCount ?? 0}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}