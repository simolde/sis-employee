"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateAttendanceExceptionAction } from "../server/attendance-exception-actions";
import {
  initialAttendanceExceptionActionState,
} from "../types/attendance-exception-types";
import type {
  AttendanceExceptionEditData,
} from "../server/attendance-exception-edit-queries";

type AttendanceExceptionEditFormProps = {
  data: AttendanceExceptionEditData;
};

const exceptionTypes = [
  {
    label: "Holiday",
    value: "HOLIDAY",
  },
  {
    label: "Class Suspension",
    value: "CLASS_SUSPENSION",
  },
  {
    label: "No Work",
    value: "NO_WORK",
  },
  {
    label: "School Event",
    value: "SCHOOL_EVENT",
  },
  {
    label: "Rest Day",
    value: "REST_DAY",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

export function AttendanceExceptionEditForm({
  data,
}: AttendanceExceptionEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateAttendanceExceptionAction,
    initialAttendanceExceptionActionState,
  );

  return (
    <section className="starland-card p-5">
      <div>
        <span className="starland-badge starland-badge-warning">
          Edit Exception
        </span>

        <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
          Update Attendance Exception Date
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          Update the exception date, branch scope, type, title, ABSENT
          generation rule, or status. Every update is saved to the activity log.
        </p>
      </div>

      <form action={formAction} className="mt-4 grid gap-4 xl:grid-cols-4">
        <input type="hidden" name="exceptionId" value={data.exceptionId} />

        <div>
          <label
            htmlFor="exceptionDate"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Date
          </label>

          <input
            id="exceptionDate"
            name="exceptionDate"
            type="date"
            className="starland-input mt-2"
            defaultValue={data.exceptionDateInput}
            required
          />

          {state.fieldErrors?.exceptionDate ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {state.fieldErrors.exceptionDate[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="branchId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Branch
          </label>

          <select
            id="branchId"
            name="branchId"
            className="starland-input mt-2"
            defaultValue={data.branchId}
          >
            <option value="">All branches</option>
            {data.options.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="exceptionType"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Type
          </label>

          <select
            id="exceptionType"
            name="exceptionType"
            className="starland-input mt-2"
            defaultValue={data.exceptionType}
            required
          >
            {exceptionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {state.fieldErrors?.exceptionType ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {state.fieldErrors.exceptionType[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="status"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Status
          </label>

          <select
            id="status"
            name="status"
            className="starland-input mt-2"
            defaultValue={data.status}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {state.fieldErrors?.status ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {state.fieldErrors.status[0]}
            </p>
          ) : null}
        </div>

        <div className="xl:col-span-2">
          <label
            htmlFor="title"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Title
          </label>

          <input
            id="title"
            name="title"
            className="starland-input mt-2"
            placeholder="Example: Independence Day / Class Suspension"
            defaultValue={data.title}
            required
          />

          {state.fieldErrors?.title ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {state.fieldErrors.title[0]}
            </p>
          ) : null}
        </div>

        <div className="xl:col-span-2">
          <label
            htmlFor="description"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Description
          </label>

          <input
            id="description"
            name="description"
            className="starland-input mt-2"
            placeholder="Optional notes"
            defaultValue={data.description}
          />
        </div>

        <div className="xl:col-span-4">
          <label className="flex items-start gap-2 text-sm font-semibold text-[var(--starland-dark-text)]">
            <input
              name="affectsAbsenceGeneration"
              type="checkbox"
              className="mt-1"
              defaultChecked={data.affectsAbsenceGeneration}
            />
            Exclude affected employees from ABSENT generation
          </label>
        </div>

        <div className="xl:col-span-4">
          <button
            type="submit"
            className="starland-btn starland-btn-primary"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Save Changes
          </button>
        </div>
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