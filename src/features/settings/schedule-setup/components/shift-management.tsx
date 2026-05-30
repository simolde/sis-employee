"use client";

import { useActionState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import {
  createShiftAction,
  updateShiftAction,
} from "../server/schedule-setup-actions";
import {
  initialScheduleSetupActionState,
  type ShiftListItem,
} from "../types/schedule-setup-types";

type ShiftManagementProps = {
  shifts: ShiftListItem[];
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

function StatusBadge({ status }: { status: ShiftListItem["status"] }) {
  return (
    <span
      className={[
        "starland-badge",
        status === "ACTIVE"
          ? "starland-badge-success"
          : status === "INACTIVE"
            ? "starland-badge-warning"
            : "starland-badge-danger",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function ShiftRow({ shift }: { shift: ShiftListItem }) {
  const [state, formAction, isPending] = useActionState(
    updateShiftAction,
    initialScheduleSetupActionState,
  );

  return (
    <tr>
      <td>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="shiftId" value={shift.shiftId} />

          {state.message ? (
            <div
              className={[
                "rounded-2xl border px-3 py-2 text-xs font-semibold",
                state.ok
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700",
              ].join(" ")}
            >
              {state.message}
            </div>
          ) : null}

          <div className="grid min-w-[920px] gap-3 xl:grid-cols-[0.7fr_1fr_0.7fr_0.7fr_0.6fr_0.7fr_0.8fr_auto]">
            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Code
              </label>
              <input
                name="shiftCode"
                className="starland-input mt-1 uppercase"
                defaultValue={shift.shiftCode}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.shiftCode} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Name
              </label>
              <input
                name="name"
                className="starland-input mt-1"
                defaultValue={shift.name}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Start
              </label>
              <input
                name="startTime"
                type="time"
                className="starland-input mt-1"
                defaultValue={shift.startTime}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.startTime} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                End
              </label>
              <input
                name="endTime"
                type="time"
                className="starland-input mt-1"
                defaultValue={shift.endTime}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.endTime} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Grace
              </label>
              <input
                name="graceMinutes"
                type="number"
                min="0"
                max="240"
                className="starland-input mt-1"
                defaultValue={shift.graceMinutes}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.graceMinutes} />
            </div>

            <label className="flex items-end gap-2 pb-3 text-xs font-bold text-[var(--starland-dark-text)]">
              <input
                name="isOvernight"
                type="checkbox"
                defaultChecked={shift.isOvernight}
                disabled={isPending}
              />
              Overnight
            </label>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Status
              </label>
              <select
                name="status"
                className="starland-input mt-1"
                defaultValue={shift.status}
                disabled={isPending}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <FieldError messages={state.fieldErrors?.status} />
            </div>

            <div className="flex items-end">
              <ConfirmSubmitButton
                type="submit"
                confirmMessage="Save shift changes?"
                className="starland-btn starland-btn-primary starland-btn-sm"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </ConfirmSubmitButton>
            </div>
          </div>
        </form>
      </td>

      <td>
        <StatusBadge status={shift.status} />
      </td>
      <td>{shift.isOvernight ? "YES" : "NO"}</td>
      <td>{shift.createdAt}</td>
      <td>{shift.updatedAt}</td>
    </tr>
  );
}

export function ShiftManagement({ shifts }: ShiftManagementProps) {
  const [state, formAction, isPending] = useActionState(
    createShiftAction,
    initialScheduleSetupActionState,
  );

  return (
    <div className="space-y-5">
      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <h2 className="text-2xl font-extrabold">Add Shift</h2>
          <p className="mt-2 text-sm text-white/70">
            Create time-in/time-out rules used by schedules and attendance
            calculations.
          </p>
        </div>

        <form action={formAction} className="space-y-4 p-5 sm:p-6">
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Shift Code
              </label>
              <input
                name="shiftCode"
                className="starland-input mt-2 uppercase"
                placeholder="REG-AM"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.shiftCode} />
            </div>

            <div className="xl:col-span-2">
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Shift Name
              </label>
              <input
                name="name"
                className="starland-input mt-2"
                placeholder="Regular Morning Shift"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Start Time
              </label>
              <input
                name="startTime"
                type="time"
                className="starland-input mt-2"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.startTime} />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                End Time
              </label>
              <input
                name="endTime"
                type="time"
                className="starland-input mt-2"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.endTime} />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Grace Minutes
              </label>
              <input
                name="graceMinutes"
                type="number"
                min="0"
                max="240"
                className="starland-input mt-2"
                defaultValue="0"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.graceMinutes} />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-sm font-bold text-[var(--starland-dark-text)]">
            <input name="isOvernight" type="checkbox" disabled={isPending} />
            Overnight shift
          </label>

          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Create this shift?"
            className="starland-btn starland-btn-primary w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Shift
              </>
            )}
          </ConfirmSubmitButton>
        </form>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Shifts
          </h2>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Shift</th>
                <th>Status</th>
                <th>Overnight</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length > 0 ? (
                shifts.map((shift) => (
                  <ShiftRow key={shift.shiftId} shift={shift} />
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No shifts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}