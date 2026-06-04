"use client";

import { useActionState } from "react";
import { Loader2, TimerOff } from "lucide-react";
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

function HiddenFilters({ filters }: { filters: AbsenceCandidateFilters }) {
  return (
    <>
      <input type="hidden" name="date" value={filters.date} />
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="branchId" value={filters.branchId} />
      <input type="hidden" name="departmentId" value={filters.departmentId} />
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

  const candidateCount = result.summary.candidateAbsences;
  const willGenerateCount = Math.min(candidateCount, limit);

  return (
    <section className="starland-card p-5 print:hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="starland-badge starland-badge-danger">
            Generate ABSENT
          </span>

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Generate ABSENT Records from This Preview
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            This creates normal automatic ABSENT attendance records for
            candidates in the current filter result. It does not mark them as
            manual records. Maximum records per run: {limit}.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Will generate up to {willGenerateCount} of {candidateCount} candidate
          absence(s).
        </div>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <HiddenFilters filters={result.filters} />
        <input type="hidden" name="limit" value={limit} />

        <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          <input name="confirmGenerate" type="checkbox" className="mt-1" />
          <span>
            I already reviewed the preview and confirmed these employees should
            not be excluded because of approved leave, holiday, suspension,
            official rest day, or other school exception.
          </span>
        </label>

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={isPending || candidateCount === 0}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <TimerOff className="h-4 w-4" aria-hidden="true" />
          )}
          Generate ABSENT Records
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