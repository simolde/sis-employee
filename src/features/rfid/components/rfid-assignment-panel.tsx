"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { IdCard, Loader2, RadioTower, Save } from "lucide-react";
import { assignRfidCardAction } from "../server/rfid-actions";
import { initialRfidActionState } from "../types/rfid-action-state";
import type { RfidEmployeeOption } from "../types/rfid-types";

type RfidAssignmentPanelProps = {
  employees: RfidEmployeeOption[];
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

export function RfidAssignmentPanel({ employees }: RfidAssignmentPanelProps) {
  const rfidInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [state, formAction, isPending] = useActionState(
    assignRfidCardAction,
    initialRfidActionState,
  );

  useEffect(() => {
    if (selectedEmployeeId) {
      rfidInputRef.current?.focus();
    }
  }, [selectedEmployeeId]);

  const selectedEmployee = employees.find(
    (employee) => String(employee.empId) === selectedEmployeeId,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Ready to Scan
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
              Assign RFID Card
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Select an employee, then tap or scan the RFID card. USB RFID
              scanners usually type the UID into the focused input field.
            </p>
          </div>

          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:flex">
            <RadioTower className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>
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
            value={selectedEmployeeId}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
            disabled={isPending}
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.empId} value={employee.empId}>
                {employee.empNumber} · {employee.fullName}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.empId} />
        </div>

        {selectedEmployee ? (
          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
              {selectedEmployee.fullName}
            </p>
            <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
              {selectedEmployee.empNumber} · {selectedEmployee.departmentName} ·{" "}
              {selectedEmployee.branchName}
            </p>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="rfidUid"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            RFID UID
          </label>
          <div className="relative mt-2">
            <IdCard
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--starland-muted-text)]"
              aria-hidden="true"
            />
            <input
              ref={rfidInputRef}
              id="rfidUid"
              name="rfidUid"
              className="starland-input pl-10 font-mono"
              placeholder="Tap or scan RFID card"
              autoComplete="off"
              disabled={isPending}
            />
          </div>
          <FieldError messages={state.fieldErrors?.rfidUid} />
        </div>

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
            placeholder="Optional note"
            disabled={isPending}
          />
          <FieldError messages={state.fieldErrors?.remarks} />
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-sm leading-6 text-[var(--starland-muted-text)]">
          Assigning a new RFID card automatically marks the employee’s old
          active RFID card as <strong>REPLACED</strong>. Every assignment and
          replacement is recorded in audit logs.
        </div>

        <button
          type="submit"
          className="starland-btn starland-btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Assigning...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Assign RFID Card
            </>
          )}
        </button>
      </form>
    </section>
  );
}