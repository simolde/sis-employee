"use client";

import { useActionState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import {
  createScheduleAction,
  updateScheduleAction,
} from "../server/schedule-setup-actions";
import {
  initialScheduleSetupActionState,
  type ShiftOption,
  type ShiftScheduleListItem,
} from "../types/schedule-setup-types";

type ScheduleManagementProps = {
  shiftOptions: ShiftOption[];
  schedules: ShiftScheduleListItem[];
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

function StatusBadge({ status }: { status: ShiftScheduleListItem["status"] }) {
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

function ScheduleRow({
  schedule,
  shiftOptions,
}: {
  schedule: ShiftScheduleListItem;
  shiftOptions: ShiftOption[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateScheduleAction,
    initialScheduleSetupActionState,
  );

  return (
    <tr>
      <td>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="scheduleId" value={schedule.scheduleId} />

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

          <div className="grid min-w-[1100px] gap-3 xl:grid-cols-[0.7fr_1fr_1.4fr_1fr_0.8fr_0.8fr_0.8fr_auto]">
            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Code
              </label>
              <input
                name="scheduleCode"
                className="starland-input mt-1 uppercase"
                defaultValue={schedule.scheduleCode}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.scheduleCode} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Name
              </label>
              <input
                name="name"
                className="starland-input mt-1"
                defaultValue={schedule.name}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Shift
              </label>
              <select
                name="shiftId"
                className="starland-input mt-1"
                defaultValue={schedule.shiftId}
                disabled={isPending}
              >
                {shiftOptions.map((shift) => (
                  <option key={shift.shiftId} value={shift.shiftId}>
                    {shift.label}
                  </option>
                ))}
              </select>
              <FieldError messages={state.fieldErrors?.shiftId} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Days
              </label>
              <input
                name="daysOfWeek"
                className="starland-input mt-1 uppercase"
                defaultValue={schedule.daysOfWeek === "—" ? "" : schedule.daysOfWeek}
                placeholder="MON,TUE,WED,THU,FRI"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.daysOfWeek} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                From
              </label>
              <input
                name="effectiveFrom"
                type="date"
                className="starland-input mt-1"
                defaultValue={schedule.effectiveFromInput}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.effectiveFrom} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                To
              </label>
              <input
                name="effectiveTo"
                type="date"
                className="starland-input mt-1"
                defaultValue={schedule.effectiveToInput}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.effectiveTo} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Status
              </label>
              <select
                name="status"
                className="starland-input mt-1"
                defaultValue={schedule.status}
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
                confirmMessage="Save schedule changes?"
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
        <StatusBadge status={schedule.status} />
      </td>
      <td>
        {schedule.shiftCode} · {schedule.shiftName}
      </td>
      <td>
        {schedule.effectiveFrom} - {schedule.effectiveTo}
      </td>
      <td>{schedule.createdAt}</td>
      <td>{schedule.updatedAt}</td>
    </tr>
  );
}

export function ScheduleManagement({
  shiftOptions,
  schedules,
}: ScheduleManagementProps) {
  const [state, formAction, isPending] = useActionState(
    createScheduleAction,
    initialScheduleSetupActionState,
  );

  return (
    <div className="space-y-5">
      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <h2 className="text-2xl font-extrabold">Add Schedule</h2>
          <p className="mt-2 text-sm text-white/70">
            Create schedule records assigned to employees and attendance
            records.
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
                Schedule Code
              </label>
              <input
                name="scheduleCode"
                className="starland-input mt-2 uppercase"
                placeholder="REG-MF"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.scheduleCode} />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Schedule Name
              </label>
              <input
                name="name"
                className="starland-input mt-2"
                placeholder="Regular Monday to Friday"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>

            <div className="xl:col-span-2">
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Shift
              </label>
              <select
                name="shiftId"
                className="starland-input mt-2"
                defaultValue=""
                disabled={isPending}
              >
                <option value="">Select active shift</option>
                {shiftOptions.map((shift) => (
                  <option key={shift.shiftId} value={shift.shiftId}>
                    {shift.label}
                  </option>
                ))}
              </select>
              <FieldError messages={state.fieldErrors?.shiftId} />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Effective From
              </label>
              <input
                name="effectiveFrom"
                type="date"
                className="starland-input mt-2"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.effectiveFrom} />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Effective To
              </label>
              <input
                name="effectiveTo"
                type="date"
                className="starland-input mt-2"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.effectiveTo} />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-[var(--starland-dark-text)]">
              Days of Week
            </label>
            <input
              name="daysOfWeek"
              className="starland-input mt-2 uppercase"
              placeholder="MON,TUE,WED,THU,FRI"
              disabled={isPending}
            />
            <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
              Use comma-separated values. Example: MON,TUE,WED,THU,FRI
            </p>
            <FieldError messages={state.fieldErrors?.daysOfWeek} />
          </div>

          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Create this schedule?"
            className="starland-btn starland-btn-primary w-full"
            disabled={isPending || shiftOptions.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Schedule
              </>
            )}
          </ConfirmSubmitButton>

          {shiftOptions.length === 0 ? (
            <p className="text-sm font-semibold text-[var(--starland-danger)]">
              Create an active shift first before creating a schedule.
            </p>
          ) : null}
        </form>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Schedules
          </h2>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Schedule</th>
                <th>Status</th>
                <th>Shift</th>
                <th>Effective</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <ScheduleRow
                    key={schedule.scheduleId}
                    schedule={schedule}
                    shiftOptions={shiftOptions}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No schedules found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}