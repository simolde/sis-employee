"use client";

import {
  useActionState,
} from "react";
import {
  CalendarClock,
  History,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { bulkAssignEmployeeScheduleAction } from "../server/schedule-assignment-actions";
import {
  initialScheduleAssignmentActionState,
  type ScheduleAssignmentFilters,
  type ScheduleAssignmentPreview,
} from "../types/schedule-assignment-types";

type ScheduleAssignmentActionPanelProps = {
  filters:
    ScheduleAssignmentFilters;

  preview:
    ScheduleAssignmentPreview;

  limit: number;
};

function HiddenFilters({
  filters,
}: {
  filters:
    ScheduleAssignmentFilters;
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
        value={
          filters.branchId
        }
      />

      <input
        type="hidden"
        name="departmentId"
        value={
          filters.departmentId
        }
      />

      <input
        type="hidden"
        name="designationId"
        value={
          filters.designationId
        }
      />

      <input
        type="hidden"
        name="empTypeId"
        value={
          filters.empTypeId
        }
      />

      <input
        type="hidden"
        name="currentScheduleId"
        value={
          filters.currentScheduleId
        }
      />

      <input
        type="hidden"
        name="activeOnly"
        value={
          filters.activeOnly
            ? "true"
            : "false"
        }
      />

      <input
        type="hidden"
        name="targetScheduleId"
        value={
          filters.targetScheduleId
        }
      />

      <input
        type="hidden"
        name="validFrom"
        value={
          filters.validFrom
        }
      />

      <input
        type="hidden"
        name="remarks"
        value={
          filters.remarks
        }
      />
    </>
  );
}

export function ScheduleAssignmentActionPanel({
  filters,
  preview,
  limit,
}: ScheduleAssignmentActionPanelProps) {
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    bulkAssignEmployeeScheduleAction,
    initialScheduleAssignmentActionState,
  );

  const canSubmit =
    preview.targetScheduleAvailable &&
    preview.wouldAssignCount >
      0 &&
    Boolean(
      filters.targetScheduleId,
    ) &&
    Boolean(
      filters.validFrom,
    );

  return (
    <section className="starland-card p-5">
      <div>
        <span className="starland-badge starland-badge-warning">
          Bulk Assignment
        </span>

        <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
          Assign or Repair Employee Schedules
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          The operation updates the current schedule
          pointer and maintains inclusive assignment
          history. Maximum records per run: {limit}.
        </p>
      </div>

      {!preview.hasSpecificFilters ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          No specific filter is selected. Tick the
          confirmation box only when you intentionally
          want to process every matching employee.
        </div>
      ) : null}

      {preview.targetScheduleIssue ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-extrabold text-red-800">
                Target schedule unavailable
              </p>

              <p className="mt-1 text-sm font-semibold leading-6 text-red-700">
                {preview.targetScheduleIssue}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <form
        action={formAction}
        className="mt-4 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
      >
        <HiddenFilters
          filters={filters}
        />

        <input
          type="hidden"
          name="limit"
          value={limit}
        />

        {!preview.hasSpecificFilters ? (
          <label className="mb-4 flex items-start gap-2 text-sm font-semibold text-[var(--starland-dark-text)]">
            <input
              name="confirmAll"
              type="checkbox"
              className="mt-1"
            />

            I understand this may assign or repair the
            target schedule for all matching employees.
          </label>
        ) : null}

        <p className="text-sm font-bold text-[var(--starland-dark-text)]">
          Target Schedule
        </p>

        <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
          {
            preview.targetScheduleLabel
          }
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="starland-badge starland-badge-info">
            Schedule changes:{" "}
            {
              preview.scheduleChangeCount
            }
          </span>

          <span className="starland-badge starland-badge-warning">
            <History
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            History repairs:{" "}
            {
              preview.historyRepairCount
            }
          </span>

          <span className="starland-badge starland-badge-success">
            Total processing:{" "}
            {Math.min(
              preview.wouldAssignCount,
              limit,
            )}
          </span>
        </div>

        {preview.historyRepairCount >
        0 ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
            Some employees already point to the target
            schedule but have no matching active history
            row. Their current schedule will remain
            unchanged while the missing history is
            repaired.
          </div>
        ) : null}

        <p className="mt-4 text-sm leading-6 text-[var(--starland-muted-text)]">
          Previous assignment rows will end one calendar
          day before{" "}
          <strong>
            {filters.validFrom ||
              "the new effective date"}
          </strong>
          . Both start and end dates are inclusive.
        </p>

        <button
          type="submit"
          className="starland-btn starland-btn-primary mt-4"
          disabled={
            isPending ||
            !canSubmit
          }
        >
          {isPending ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <CalendarClock
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          {isPending
            ? "Processing..."
            : "Assign or Repair Schedule"}
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