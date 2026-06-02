"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { saveManualAttendanceAction } from "../server/manual-attendance-actions";
import {
  initialManualAttendanceActionState,
  type ManualAttendanceEmployeeOption,
} from "../types/manual-attendance-types";

type ManualAttendanceFormProps = {
  employees: ManualAttendanceEmployeeOption[];
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

function getTodayInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ManualAttendanceForm({
  employees,
}: ManualAttendanceFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveManualAttendanceAction,
    initialManualAttendanceActionState,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          Manual Correction
        </span>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Manual Attendance Input
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Manual attendance is always marked as PENDING REVIEW and must be
          verified or approved by HR/Admin.
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

        <section className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <h3 className="text-base font-extrabold text-[var(--starland-dark-text)]">
            Employee and Date
          </h3>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_0.7fr]">
            <div>
              <label
                htmlFor="empId"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Employee <span className="text-[var(--starland-danger)]">*</span>
              </label>

              <select
                id="empId"
                name="empId"
                className="starland-input mt-2"
                defaultValue=""
                disabled={isPending}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.empId} value={employee.empId}>
                    {employee.label}
                  </option>
                ))}
              </select>

              <FieldError messages={state.fieldErrors?.empId} />
            </div>

            <div>
              <label
                htmlFor="attDate"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Attendance Date{" "}
                <span className="text-[var(--starland-danger)]">*</span>
              </label>

              <input
                id="attDate"
                name="attDate"
                type="date"
                className="starland-input mt-2"
                defaultValue={getTodayInputValue()}
                disabled={isPending}
              />

              <FieldError messages={state.fieldErrors?.attDate} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <h3 className="text-base font-extrabold text-[var(--starland-dark-text)]">
            Time Input
          </h3>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            For overnight attendance, select the next date for Time Out.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="timeIn"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Time In <span className="text-[var(--starland-danger)]">*</span>
              </label>

              <input
                id="timeIn"
                name="timeIn"
                type="datetime-local"
                className="starland-input mt-2"
                disabled={isPending}
              />

              <FieldError messages={state.fieldErrors?.timeIn} />
            </div>

            <div>
              <label
                htmlFor="timeOut"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Time Out
              </label>

              <input
                id="timeOut"
                name="timeOut"
                type="datetime-local"
                className="starland-input mt-2"
                disabled={isPending}
              />

              <FieldError messages={state.fieldErrors?.timeOut} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <h3 className="text-base font-extrabold text-[var(--starland-dark-text)]">
            Reason for Manual Input
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="reason"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Reason <span className="text-[var(--starland-danger)]">*</span>
              </label>

              <textarea
                id="reason"
                name="reason"
                className="starland-input mt-2 min-h-28"
                placeholder="Example: RFID reader failed, biometric unavailable, forgot to scan, approved correction, etc."
                disabled={isPending}
              />

              <FieldError messages={state.fieldErrors?.reason} />
            </div>

            <div>
              <label
                htmlFor="remarks"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Remarks <span className="text-[var(--starland-danger)]">*</span>
              </label>

              <textarea
                id="remarks"
                name="remarks"
                className="starland-input mt-2 min-h-28"
                placeholder="Additional HR/Admin remarks."
                disabled={isPending}
              />

              <FieldError messages={state.fieldErrors?.remarks} />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="address"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Address / Location Note
            </label>

            <input
              id="address"
              name="address"
              className="starland-input mt-2"
              placeholder="Optional location note"
              disabled={isPending}
            />

            <FieldError messages={state.fieldErrors?.address} />
          </div>
        </section>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
          Manual attendance will not be treated as a normal RFID/biometric/ODL
          punch. It will be saved as PENDING REVIEW until reviewed by HR/Admin.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--starland-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard/attendance"
            className="starland-btn starland-btn-soft"
            aria-disabled={isPending}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Attendance
          </Link>

          <button
            type="submit"
            className="starland-btn starland-btn-primary"
            disabled={isPending || employees.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save Manual Attendance
              </>
            )}
          </button>
        </div>

        {employees.length === 0 ? (
          <p className="text-sm font-semibold text-[var(--starland-danger)]">
            No active employees found.
          </p>
        ) : null}
      </form>
    </section>
  );
}