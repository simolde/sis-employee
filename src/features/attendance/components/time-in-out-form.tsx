"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { recordManualAttendanceAction } from "../server/attendance-actions";
import { initialAttendanceActionState } from "../types/attendance-action-state";
import type { AttendanceFormOptions } from "../server/attendance-form-queries";
import { LocationCapture } from "./location-capture";
import { WebcamCapture } from "./webcam-capture";

type TimeInOutFormProps = {
  options: AttendanceFormOptions;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

export function TimeInOutForm({ options }: TimeInOutFormProps) {
  const [state, formAction, isPending] = useActionState(
    recordManualAttendanceAction,
    initialAttendanceActionState,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          Manual Web Punch
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Time-In / Time-Out
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Record a web-based attendance punch with branch, GPS coordinates,
          address, photo path, reason, and remarks.
        </p>
      </div>

      <form action={formAction} className="space-y-5 p-5 sm:p-6">
        {state.message ? (
          <div
            className={[
              "rounded-2xl border px-4 py-3 text-sm font-semibold",
              state.ok
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
          >
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label
              htmlFor="empId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Employee
            </label>
            <select
              id="empId"
              name="empId"
              className="starland-input mt-2"
              defaultValue=""
              disabled={isPending}
            >
              <option value="">Select employee</option>
              {options.employees.map((employee) => (
                <option key={employee.empId} value={employee.empId}>
                  {employee.empNumber} · {employee.fullName}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.empId} />
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
              defaultValue=""
              disabled={isPending}
            >
              <option value="">Select branch</option>
              {options.branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.name}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.branchId} />
          </div>

          <div>
            <label
              htmlFor="punchType"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Punch Type
            </label>
            <select
              id="punchType"
              name="punchType"
              className="starland-input mt-2"
              defaultValue="TIME_IN"
              disabled={isPending}
            >
              <option value="TIME_IN">Time In</option>
              <option value="TIME_OUT">Time Out</option>
            </select>
            <FieldError messages={state.fieldErrors?.punchType} />
          </div>
        </div>

        <WebcamCapture disabled={isPending} />

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <label
              htmlFor="latitude"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Latitude
            </label>
            <input
              id="latitude"
              name="latitude"
              className="starland-input mt-2"
              placeholder="14.5995"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.latitude} />
          </div>

          <div>
            <label
              htmlFor="longitude"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Longitude
            </label>
            <input
              id="longitude"
              name="longitude"
              className="starland-input mt-2"
              placeholder="120.9842"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.longitude} />
          </div>

          <LocationCapture disabled={isPending} />
        </div>

        <div>
          <label
            htmlFor="address"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            className="starland-input mt-2 min-h-24 resize-y"
            placeholder="Readable location address"
            disabled={isPending}
          />
          <FieldError messages={state.fieldErrors?.address} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label
              htmlFor="remarks"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              className="starland-input mt-2 min-h-24 resize-y"
              placeholder="Optional remarks"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.remarks} />
          </div>

          <div>
            <label
              htmlFor="reason"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Reason
            </label>
            <textarea
              id="reason"
              name="reason"
              className="starland-input mt-2 min-h-24 resize-y"
              placeholder="Reason for manual/web punch"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.reason} />
          </div>
        </div>

        <button
          type="submit"
          className="starland-btn starland-btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Recording...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Record Attendance
            </>
          )}
        </button>
      </form>
    </section>
  );
}