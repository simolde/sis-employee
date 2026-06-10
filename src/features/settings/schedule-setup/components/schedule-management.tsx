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
  createScheduleAction,
  updateScheduleAction,
} from "../server/schedule-setup-actions";
import {
  initialScheduleSetupActionState,
  type ShiftOption,
  type ShiftScheduleListItem,
} from "../types/schedule-setup-types";

type ScheduleManagementProps = {
  shiftOptions:
    ShiftOption[];

  schedules:
    ShiftScheduleListItem[];
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
    ShiftScheduleListItem["status"];
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

function ScheduleDependencyNotice({
  schedule,
}: {
  schedule:
    ShiftScheduleListItem;
}) {
  if (
    !schedule.coreEditingLocked &&
    !schedule.statusChangeLocked
  ) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
        Core schedule rules may be edited because no
        employee, assignment history, or attendance
        record depends on them.
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
            Schedule rules protected
          </p>

          <p className="mt-1 text-xs font-semibold leading-5 text-amber-700">
            Shift, weekdays, and effective dates are
            locked after the schedule is assigned or
            used by attendance. Create a new schedule
            for future rule changes.
          </p>
        </div>
      </div>
    </div>
  );
}

function ScheduleRow({
  schedule,
  shiftOptions,
}: {
  schedule:
    ShiftScheduleListItem;

  shiftOptions:
    ShiftOption[];
}) {
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    updateScheduleAction,
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
            name="scheduleId"
            value={
              schedule.scheduleId
            }
          />

          {schedule.coreEditingLocked ? (
            <>
              <input
                type="hidden"
                name="shiftId"
                value={
                  schedule.shiftId
                }
              />

              <input
                type="hidden"
                name="daysOfWeek"
                value={
                  schedule.daysOfWeek ===
                  "—"
                    ? ""
                    : schedule.daysOfWeek
                }
              />

              <input
                type="hidden"
                name="effectiveFrom"
                value={
                  schedule.effectiveFromInput
                }
              />

              <input
                type="hidden"
                name="effectiveTo"
                value={
                  schedule.effectiveToInput
                }
              />
            </>
          ) : null}

          {schedule.statusChangeLocked ? (
            <input
              type="hidden"
              name="status"
              value={
                schedule.status
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

          <ScheduleDependencyNotice
            schedule={
              schedule
            }
          />

          <div className="flex flex-wrap gap-2">
            <span className="starland-badge starland-badge-success">
              Current employees:{" "}
              {
                schedule.currentEmployeeCount
              }
            </span>

            <span className="starland-badge starland-badge-warning">
              Assignment history:{" "}
              {
                schedule.assignmentHistoryCount
              }
            </span>

            <span className="starland-badge starland-badge-info">
              Active assignments:{" "}
              {
                schedule.activeAssignmentCount
              }
            </span>

            <span className="starland-badge starland-badge-danger">
              Attendance:{" "}
              {
                schedule.attendanceCount
              }
            </span>
          </div>

          <div className="grid min-w-[1160px] gap-3 xl:grid-cols-[0.7fr_1fr_1.4fr_1fr_0.8fr_0.8fr_0.8fr_auto]">
            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Code
              </label>

              <input
                name="scheduleCode"
                className="starland-input mt-1 uppercase"
                defaultValue={
                  schedule.scheduleCode
                }
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.scheduleCode
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
                  schedule.name
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
                Shift
              </label>

              <select
                name={
                  schedule.coreEditingLocked
                    ? undefined
                    : "shiftId"
                }
                className="starland-input mt-1"
                defaultValue={
                  schedule.shiftId
                }
                disabled={
                  isPending ||
                  schedule.coreEditingLocked
                }
              >
                {shiftOptions.map(
                  (shift) => (
                    <option
                      key={
                        shift.shiftId
                      }
                      value={
                        shift.shiftId
                      }
                      disabled={
                        shift.status !==
                          "ACTIVE" &&
                        shift.shiftId !==
                          schedule.shiftId
                      }
                    >
                      {shift.label}
                    </option>
                  ),
                )}
              </select>

              <FieldError
                messages={
                  state.fieldErrors
                    ?.shiftId
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Days
              </label>

              <input
                name={
                  schedule.coreEditingLocked
                    ? undefined
                    : "daysOfWeek"
                }
                className="starland-input mt-1 uppercase"
                defaultValue={
                  schedule.daysOfWeek ===
                  "—"
                    ? ""
                    : schedule.daysOfWeek
                }
                placeholder="MON,TUE,WED,THU,FRI"
                disabled={
                  isPending ||
                  schedule.coreEditingLocked
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.daysOfWeek
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                From
              </label>

              <input
                name={
                  schedule.coreEditingLocked
                    ? undefined
                    : "effectiveFrom"
                }
                type="date"
                className="starland-input mt-1"
                defaultValue={
                  schedule.effectiveFromInput
                }
                disabled={
                  isPending ||
                  schedule.coreEditingLocked
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.effectiveFrom
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                To
              </label>

              <input
                name={
                  schedule.coreEditingLocked
                    ? undefined
                    : "effectiveTo"
                }
                type="date"
                className="starland-input mt-1"
                defaultValue={
                  schedule.effectiveToInput
                }
                disabled={
                  isPending ||
                  schedule.coreEditingLocked
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.effectiveTo
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Status
              </label>

              <select
                name={
                  schedule.statusChangeLocked
                    ? undefined
                    : "status"
                }
                className="starland-input mt-1"
                defaultValue={
                  schedule.status
                }
                disabled={
                  isPending ||
                  schedule.statusChangeLocked
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
                confirmMessage="Save schedule changes?"
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
            schedule.status
          }
        />
      </td>

      <td>
        {schedule.shiftCode} ·{" "}
        {schedule.shiftName}

        {schedule.shiftStatus !==
        "ACTIVE" ? (
          <span className="ml-2 starland-badge starland-badge-danger">
            {
              schedule.shiftStatus
            }
          </span>
        ) : null}
      </td>

      <td>
        {
          schedule.effectiveFrom
        }{" "}
        -{" "}
        {
          schedule.effectiveTo
        }
      </td>

      <td>
        {schedule.createdAt}
      </td>

      <td>
        {schedule.updatedAt}
      </td>
    </tr>
  );
}

export function ScheduleManagement({
  shiftOptions,
  schedules,
}: ScheduleManagementProps) {
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    createScheduleAction,
    initialScheduleSetupActionState,
  );

  const activeShiftOptions =
    shiftOptions.filter(
      (shift) =>
        shift.status ===
        "ACTIVE",
    );

  return (
    <div className="space-y-5">
      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <h2 className="text-2xl font-extrabold">
            Add Schedule
          </h2>

          <p className="mt-2 text-sm text-white/70">
            Create a schedule template connected to an
            active shift. Leave Days of Week empty only
            when the schedule applies every day.
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
                Schedule Code
              </label>

              <input
                name="scheduleCode"
                className="starland-input mt-2 uppercase"
                placeholder="REG_MF"
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.scheduleCode
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Schedule Name
              </label>

              <input
                name="name"
                className="starland-input mt-2"
                placeholder="Regular Monday to Friday"
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

            <div className="xl:col-span-2">
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Shift
              </label>

              <select
                name="shiftId"
                className="starland-input mt-2"
                defaultValue=""
                disabled={
                  isPending
                }
              >
                <option value="">
                  Select active shift
                </option>

                {activeShiftOptions.map(
                  (shift) => (
                    <option
                      key={
                        shift.shiftId
                      }
                      value={
                        shift.shiftId
                      }
                    >
                      {shift.label}
                    </option>
                  ),
                )}
              </select>

              <FieldError
                messages={
                  state.fieldErrors
                    ?.shiftId
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Effective From
              </label>

              <input
                name="effectiveFrom"
                type="date"
                className="starland-input mt-2"
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.effectiveFrom
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Effective To
              </label>

              <input
                name="effectiveTo"
                type="date"
                className="starland-input mt-2"
                disabled={
                  isPending
                }
              />

              <FieldError
                messages={
                  state.fieldErrors
                    ?.effectiveTo
                }
              />
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
              disabled={
                isPending
              }
            />

            <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
              Accepted values: MON, TUE, WED, THU, FRI,
              SAT, SUN. Values are automatically stored
              in canonical weekday order. Leave empty
              only for an every-day schedule.
            </p>

            <FieldError
              messages={
                state.fieldErrors
                  ?.daysOfWeek
              }
            />
          </div>

          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Create this schedule?"
            className="starland-btn starland-btn-primary w-full"
            disabled={
              isPending ||
              activeShiftOptions.length ===
                0
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

                Create Schedule
              </>
            )}
          </ConfirmSubmitButton>

          {activeShiftOptions.length ===
          0 ? (
            <p className="text-sm font-semibold text-[var(--starland-danger)]">
              Create or activate a shift before creating
              a schedule.
            </p>
          ) : null}
        </form>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Schedules
            </h2>

            <span className="starland-badge starland-badge-success">
              <Users
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Assignment protected
            </span>

            <span className="starland-badge starland-badge-warning">
              <History
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Historical rules preserved
            </span>
          </div>
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
              {schedules.length >
              0 ? (
                schedules.map(
                  (schedule) => (
                    <ScheduleRow
                      key={
                        schedule.scheduleId
                      }
                      schedule={
                        schedule
                      }
                      shiftOptions={
                        shiftOptions
                      }
                    />
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={6}>
                    No schedules found.
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