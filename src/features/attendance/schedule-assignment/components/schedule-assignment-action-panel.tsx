"use client";

import { useActionState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { bulkAssignEmployeeScheduleAction } from "../server/schedule-assignment-actions";
import {
  initialScheduleAssignmentActionState,
  type ScheduleAssignmentFilters,
  type ScheduleAssignmentPreview,
} from "../types/schedule-assignment-types";

type ScheduleAssignmentActionPanelProps = {
  filters: ScheduleAssignmentFilters;
  preview: ScheduleAssignmentPreview;
  limit: number;
};

function HiddenFilters({ filters }: { filters: ScheduleAssignmentFilters }) {
  return (
    <>
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="branchId" value={filters.branchId} />
      <input type="hidden" name="departmentId" value={filters.departmentId} />
      <input type="hidden" name="designationId" value={filters.designationId} />
      <input type="hidden" name="empTypeId" value={filters.empTypeId} />
      <input
        type="hidden"
        name="currentScheduleId"
        value={filters.currentScheduleId}
      />
      <input
        type="hidden"
        name="activeOnly"
        value={filters.activeOnly ? "true" : "false"}
      />
      <input
        type="hidden"
        name="targetScheduleId"
        value={filters.targetScheduleId}
      />
      <input type="hidden" name="validFrom" value={filters.validFrom} />
      <input type="hidden" name="remarks" value={filters.remarks} />
    </>
  );
}

export function ScheduleAssignmentActionPanel({
  filters,
  preview,
  limit,
}: ScheduleAssignmentActionPanelProps) {
  const [state, formAction, isPending] = useActionState(
    bulkAssignEmployeeScheduleAction,
    initialScheduleAssignmentActionState,
  );

  return (
    <section className="starland-card p-5">
      <div>
        <span className="starland-badge starland-badge-warning">
          Bulk Assignment
        </span>

        <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
          Assign Target Schedule to Matching Employees
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          This updates each employee&apos;s current schedule and creates a
          schedule assignment history record. Maximum records per run: {limit}.
        </p>
      </div>

      {!preview.hasSpecificFilters ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          No specific filter is selected. Tick the confirmation box if you
          intentionally want to apply this schedule to all matching employees.
        </div>
      ) : null}

      <form
        action={formAction}
        className="mt-4 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
      >
        <HiddenFilters filters={filters} />
        <input type="hidden" name="limit" value={limit} />

        {!preview.hasSpecificFilters ? (
          <label className="mb-4 flex items-start gap-2 text-sm font-semibold text-[var(--starland-dark-text)]">
            <input name="confirmAll" type="checkbox" className="mt-1" />
            I understand this may assign the target schedule to all matching
            employees.
          </label>
        ) : null}

        <p className="text-sm font-bold text-[var(--starland-dark-text)]">
          Target Schedule
        </p>

        <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
          {preview.targetScheduleLabel}
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
          Will update up to {Math.min(preview.wouldAssignCount, limit)} of{" "}
          {preview.wouldAssignCount} employee(s) not already using this
          schedule.
        </p>

        <button
          type="submit"
          className="starland-btn starland-btn-primary mt-4"
          disabled={
            isPending ||
            preview.wouldAssignCount === 0 ||
            !filters.targetScheduleId ||
            !filters.validFrom
          }
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
          )}
          Assign Schedule
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