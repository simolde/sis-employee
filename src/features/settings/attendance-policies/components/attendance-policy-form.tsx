"use client";

import {
  useActionState,
} from "react";
import {
  Building2,
  Camera,
  Clock3,
  FileImage,
  Globe2,
  MapPin,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import {
  useFormStatus,
} from "react-dom";
import type {
  AttendancePolicyActionState,
  AttendancePolicySettingsPageData,
  AttendancePolicyValueSource,
} from "../types/attendance-policy-types";
import { updateAttendancePolicyAction } from "../server/attendance-policy-actions";
import { INITIAL_ATTENDANCE_POLICY_ACTION_STATE } from "../validators/attendance-policy-validation";

type AttendancePolicyFormProps = {
  data:
    AttendancePolicySettingsPageData;
};

function FieldErrors({
  errors,
}: {
  errors:
    string[] | undefined;
}) {
  if (
    !errors ||
    errors.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      {errors.map(
        (error) => (
          <p
            key={error}
            className="text-xs font-semibold text-red-700"
          >
            {error}
          </p>
        ),
      )}
    </div>
  );
}

function SourceBadge({
  source,
}: {
  source:
    AttendancePolicyValueSource;
}) {
  const className =
    source === "DATABASE"
      ? "starland-badge-success"
      : source === "ENVIRONMENT"
        ? "starland-badge-info"
        : "starland-badge-warning";

  return (
    <span
      className={[
        "starland-badge",
        className,
      ].join(" ")}
    >
      {source}
    </span>
  );
}

function CheckboxField({
  id,
  name,
  label,
  description,
  defaultChecked,
  source,
}: {
  id: string;
  name: string;

  label: string;
  description: string;

  defaultChecked: boolean;

  source:
    AttendancePolicyValueSource;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--starland-border)] bg-white p-4"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={
          defaultChecked
        }
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--starland-main-green)]"
      />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-[var(--starland-dark-text)]">
            {label}
          </span>

          <SourceBadge
            source={source}
          />
        </span>

        <span className="mt-1 block text-sm leading-6 text-[var(--starland-muted-text)]">
          {description}
        </span>
      </span>
    </label>
  );
}

function SubmitButton() {
  const {
    pending,
  } = useFormStatus();

  return (
    <button
      type="submit"
      className="starland-btn starland-btn-primary"
      disabled={pending}
    >
      <Save
        className="h-4 w-4"
        aria-hidden="true"
      />

      {pending
        ? "Saving Policies..."
        : "Save Attendance Policies"}
    </button>
  );
}

export function AttendancePolicyForm({
  data,
}: AttendancePolicyFormProps) {
  const [
    state,
    formAction,
  ] = useActionState<
    AttendancePolicyActionState,
    FormData
  >(
    updateAttendancePolicyAction,
    INITIAL_ATTENDANCE_POLICY_ACTION_STATE,
  );

  const {
    config,
    sourceMap,
  } = data.resolved;

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      {state.status === "ERROR" ? (
        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800"
        >
          {state.message}
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-start gap-3">
            <Building2
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Default Attendance Branch
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Used when a punch source does not
                explicitly provide a branch.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="defaultBranchId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Active Branch
            </label>

            <SourceBadge
              source={
                sourceMap.defaultBranchId
              }
            />
          </div>

          <select
            id="defaultBranchId"
            name="defaultBranchId"
            className="starland-input mt-2"
            defaultValue={
              config.defaultBranchId ??
              ""
            }
            required
          >
            <option value="">
              Select an active branch
            </option>

            {data.branches.map(
              (branch) => (
                <option
                  key={
                    branch.branchId
                  }
                  value={
                    branch.branchId
                  }
                >
                  {branch.name} (
                  {branch.branchCode})
                </option>
              ),
            )}
          </select>

          <FieldErrors
            errors={
              state.fieldErrors
                .defaultBranchId
            }
          />
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-start gap-3">
            <Globe2
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Attendance Sources
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Control which attendance entry
                methods are available.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <CheckboxField
            id="allowWebTimeIn"
            name="allowWebTimeIn"
            label="Allow Web Time-In"
            description="Allow authorized employees to submit attendance through the web application."
            defaultChecked={
              config.allowWebTimeIn
            }
            source={
              sourceMap.allowWebTimeIn
            }
          />

          <CheckboxField
            id="allowManualTimeIn"
            name="allowManualTimeIn"
            label="Allow Manual Attendance"
            description="Allow authorized staff to manually create or correct attendance records."
            defaultChecked={
              config.allowManualTimeIn
            }
            source={
              sourceMap.allowManualTimeIn
            }
          />
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Attendance Evidence
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Configure photo and location
                requirements for attendance
                submissions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <CheckboxField
            id="requirePhoto"
            name="requirePhoto"
            label="Require Photo"
            description="Require photo evidence for attendance submissions."
            defaultChecked={
              config.requirePhoto
            }
            source={
              sourceMap.requirePhoto
            }
          />

          <CheckboxField
            id="requireLocation"
            name="requireLocation"
            label="Require Location"
            description="Require latitude and longitude for attendance submissions."
            defaultChecked={
              config.requireLocation
            }
            source={
              sourceMap.requireLocation
            }
          />
        </div>

        <div className="grid gap-5 border-t border-[var(--starland-border)] p-5 md:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="photoDirectory"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Photo Directory
              </label>

              <SourceBadge
                source={
                  sourceMap.photoDirectory
                }
              />
            </div>

            <div className="relative mt-2">
              <Camera
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--starland-muted-text)]"
                aria-hidden="true"
              />

              <input
                id="photoDirectory"
                name="photoDirectory"
                type="text"
                className="starland-input pl-9"
                defaultValue={
                  config.photoDirectory
                }
                maxLength={191}
                required
              />
            </div>

            <FieldErrors
              errors={
                state.fieldErrors
                  .photoDirectory
              }
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="maxPhotoSizeMb"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Maximum Photo Size
              </label>

              <SourceBadge
                source={
                  sourceMap.maxPhotoSizeMb
                }
              />
            </div>

            <div className="relative mt-2">
              <FileImage
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--starland-muted-text)]"
                aria-hidden="true"
              />

              <input
                id="maxPhotoSizeMb"
                name="maxPhotoSizeMb"
                type="number"
                className="starland-input pl-9"
                defaultValue={
                  config.maxPhotoSizeMb
                }
                min={1}
                max={25}
                step={1}
                required
              />
            </div>

            <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
              Allowed range: 1–25 MB.
            </p>

            <FieldErrors
              errors={
                state.fieldErrors
                  .maxPhotoSizeMb
              }
            />
          </div>
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-start gap-3">
            <Clock3
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-warning)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Late and Missing Time-Out Rules
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Configure grace periods and open
                attendance-record handling.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="lateGraceMinutes"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Late Grace Minutes
              </label>

              <SourceBadge
                source={
                  sourceMap.lateGraceMinutes
                }
              />
            </div>

            <input
              id="lateGraceMinutes"
              name="lateGraceMinutes"
              type="number"
              className="starland-input mt-2"
              defaultValue={
                config.lateGraceMinutes
              }
              min={0}
              max={180}
              step={1}
              required
            />

            <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
              Use 0 to mark attendance late
              immediately after the scheduled start.
            </p>

            <FieldErrors
              errors={
                state.fieldErrors
                  .lateGraceMinutes
              }
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="missingTimeoutMinutes"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Missing Time-Out Threshold
              </label>

              <SourceBadge
                source={
                  sourceMap.missingTimeoutMinutes
                }
              />
            </div>

            <input
              id="missingTimeoutMinutes"
              name="missingTimeoutMinutes"
              type="number"
              className="starland-input mt-2"
              defaultValue={
                config.missingTimeoutMinutes
              }
              min={60}
              max={2880}
              step={1}
              required
            />

            <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
              720 minutes equals 12 hours.
            </p>

            <FieldErrors
              errors={
                state.fieldErrors
                  .missingTimeoutMinutes
              }
            />
          </div>

          <div className="md:col-span-2">
            <CheckboxField
              id="autoMarkMissingTimeout"
              name="autoMarkMissingTimeout"
              label="Automatically Mark Missing Time-Out"
              description="Allow automation to update eligible open attendance records after the configured threshold."
              defaultChecked={
                config.autoMarkMissingTimeout
              }
              source={
                sourceMap.autoMarkMissingTimeout
              }
            />
          </div>
        </div>
      </section>

      <section className="starland-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Settings2
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <div>
              <p className="font-extrabold text-[var(--starland-dark-text)]">
                Save Global Attendance Policies
              </p>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                The update is stored in MySQL and
                recorded in the activity log.
              </p>
            </div>
          </div>

          <SubmitButton />
        </div>
      </section>
    </form>
  );
}