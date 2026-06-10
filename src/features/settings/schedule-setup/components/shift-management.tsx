"use client";

import {
  useActionState,
} from "react";
import {
  History,
  Loader2,
  LockKeyhole,
  Plus,
  Save,
  Users,
} from "lucide-react";
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
  shifts:
    ShiftListItem[];
};

function FieldError({
  messages,
}: {
  messages?: string[];
}) {
  if (
    !messages ||
    messages.length === 0
  ) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

function StatusBadge({
  status,
}: {
  status:
    ShiftListItem["status"];
}) {
  return (
    <span
      className={[
        "starland-badge",

        status === "ACTIVE"
          ? "starland-badge-success"
          : status ===
              "INACTIVE"
            ? "starland-badge-warning"
            : "starland-badge-danger",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function ShiftDependencyNotice({
  shift,
}: {
  shift:
    ShiftListItem;
}) {
  if (
    !shift.ruleEditingLocked &&
    !shift.statusChangeLocked
  ) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
        Shift rules may be edited because no employee,
        assignment history, or attendance record depends
        on them.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
      <div className="flex items-start gap-2">
        <LockKeyhole
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
          aria-hidden="true"
        />

        <div>
          <p className="text-xs font-extrabold text-amber-800">
            Historical rules protected
          </p>

          <p className="mt-1 text-xs font-semibold leading-5 text-amber-700">
            Start time, end time, grace, and overnight
            behavior are locked once employees,
            assignment history, or attendance records
            depend on this shift.
          </p>
        </div>
      </div>
    </div>
  );
}

function ShiftRow({
  shift,
}: {
  shift:
    ShiftListItem;
}) {
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    updateShiftAction,
    initialScheduleSetupActionState,
  );

  return (
    <tr>
      <td>
        <form
          action={formAction}
          className="space-y-3"
        >
          <input
            type="hidden"
            name="shiftId"
            value={
              shift.shiftId
            }
          />

          {shift.ruleEditingLocked ? (
            <>
              <input
                type="hidden"
                name="startTime"
                value={
                  shift.startTime
                }
              />

              <input
                type="hidden"
                name="endTime"
                value={
                  shift.endTime
                }
              />

              <input
                type="hidden"
                name="graceMinutes"
                value={
                  shift.graceMinutes
                }
              />

              <input
                type="hidden"
                name="isOvernight"
                value={
                  shift.isOvernight
                    ? "true"
                    : "false"
                }
              />
            </>
          ) : null}

          {shift.statusChangeLocked ? (
            <input
              type="hidden"
              name="status"
              value={
                shift.status
              }
            />
          ) : null}

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

          <ShiftDependencyNotice
            shift={shift}
          />

          <div className="flex flex-wrap gap-2">
            <span className="starland-badge starland-badge-info">
              Schedules:{" "}
              {shift.scheduleCount}
            </span>

            <span className="starland-badge starland-badge-success">
              Current employees:{" "}
              {
                shift.currentEmployeeCount
              }
            </span>

            <span className="starland-badge starland-badge-warning">
              Assignment history:{" "}
              {
                shift.assignmentHistoryCount
              }
            </span>

            <span className="starland-badge starland-badge-danger">
              Attendance:{" "}
              {shift.attendanceCount}
            </span>
          </div>

          <div className="grid min-w-[980px] gap-3 xl:grid-cols-[0.7fr_1fr_0.7fr_0.7fr_0.6fr_0.7fr_0.8fr_auto]">
            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Code
              </label>

              <input
                name="shiftCode"
                className="starland-input mt-1 uppercase"
                defaultValue={
                  shift.shiftCode
                }
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.shiftCode
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Name
              </label>

              <input
                name="name"
                className="starland-input mt-1"
                defaultValue={
                  shift.name
                }
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.name
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Start
              </label>

              <input
                name={
                  shift.ruleEditingLocked
                    ? undefined
                    : "startTime"
                }
                type="time"
                className="starland-input mt-1"
                defaultValue={
                  shift.startTime
                }
                disabled={
                  isPending ||
                  shift.ruleEditingLocked
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.startTime
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                End
              </label>

              <input
                name={
                  shift.ruleEditingLocked
                    ? undefined
                    : "endTime"
                }
                type="time"
                className="starland-input mt-1"
                defaultValue={
                  shift.endTime
                }
                disabled={
                  isPending ||
                  shift.ruleEditingLocked
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.endTime
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Grace
              </label>

              <input
                name={
                  shift.ruleEditingLocked
                    ? undefined
                    : "graceMinutes"
                }
                type="number"
                min="0"
                max="240"
                className="starland-input mt-1"
                defaultValue={
                  shift.graceMinutes
                }
                disabled={
                  isPending ||
                  shift.ruleEditingLocked
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.graceMinutes
                }
              />
            </div>

            <label className="flex items-end gap-2 pb-3 text-xs font-bold text-[var(--starland-dark-text)]">
              <input
                name={
                  shift.ruleEditingLocked
                    ? undefined
                    : "isOvernight"
                }
                type="checkbox"
                defaultChecked={
                  shift.isOvernight
                }
                disabled={
                  isPending ||
                  shift.ruleEditingLocked
                }
              />

              Overnight
            </label>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Status
              </label>

              <select
                name={
                  shift.statusChangeLocked
                    ? undefined
                    : "status"
                }
                className="starland-input mt-1"
                defaultValue={
                  shift.status
                }
                disabled={
                  isPending ||
                  shift.statusChangeLocked
                }
              >
                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>

                <option value="ARCHIVED">
                  ARCHIVED
                </option>
              </select>

              <FieldError
                messages={
                  state.fieldErrors
                    ?.status
                }
              />
            </div>

            <div className="flex items-end">
              <ConfirmSubmitButton
                type="submit"
                confirmMessage="Save shift changes?"
                className="starland-btn starland-btn-primary starland-btn-sm"
                disabled={
                  isPending
                }
              >
                {isPending ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    Save
                  </>
                )}
              </ConfirmSubmitButton>
            </div>
          </div>
        </form>
      </td>

      <td>
        <StatusBadge
          status={
            shift.status
          }
        />
      </td>

      <td>
        {shift.isOvernight
          ? "YES"
          : "NO"}
      </td>

      <td>
        {shift.createdAt}
      </td>

      <td>
        {shift.updatedAt}
      </td>
    </tr>
  );
}

export function ShiftManagement({
  shifts,
}: ShiftManagementProps) {
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    createShiftAction,
    initialScheduleSetupActionState,
  );

  return (
    <div className="space-y-5">
      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <h2 className="text-2xl font-extrabold">
            Add Shift
          </h2>

          <p className="mt-2 text-sm text-white/70">
            Create reusable time-in and time-out rules.
            Create a new shift instead of modifying a
            historical shift used by attendance records.
          </p>
        </div>

        <form
          action={formAction}
          className="space-y-4 p-5 sm:p-6"
        >
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
                placeholder="REG_AM"
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.shiftCode
                }
              />
            </div>

            <div className="xl:col-span-2">
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Shift Name
              </label>

              <input
                name="name"
                className="starland-input mt-2"
                placeholder="Regular Morning Shift"
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.name
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Start Time
              </label>

              <input
                name="startTime"
                type="time"
                className="starland-input mt-2"
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.startTime
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                End Time
              </label>

              <input
                name="endTime"
                type="time"
                className="starland-input mt-2"
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.endTime
                }
              />
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
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.graceMinutes
                }
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-sm font-bold text-[var(--starland-dark-text)]">
            <input
              name="isOvernight"
              type="checkbox"
              disabled={
                isPending
              }
            />

            Overnight shift
          </label>

          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Create this shift?"
            className="starland-btn starland-btn-primary w-full"
            disabled={
              isPending
            }
          >
            {isPending ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />

                Creating...
              </>
            ) : (
              <>
                <Plus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Create Shift
              </>
            )}
          </ConfirmSubmitButton>
        </form>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Shifts
            </h2>

            <span className="starland-badge starland-badge-info">
              <Users
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Dependency protected
            </span>

            <span className="starland-badge starland-badge-warning">
              <History
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              History preserved
            </span>
          </div>
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
              {shifts.length >
              0 ? (
                shifts.map(
                  (shift) => (
                    <ShiftRow
                      key={
                        shift.shiftId
                      }
                      shift={
                        shift
                      }
                    />
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={5}>
                    No shifts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}