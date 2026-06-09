"use client";

import {
  useActionState,
} from "react";
import {
  Building2,
  MapPin,
  Save,
} from "lucide-react";
import {
  useFormStatus,
} from "react-dom";
import {
  BRANCH_STATUSES,
  type BranchFormActionState,
  type BranchRecord,
} from "../types/branch-management-types";
import {
  INITIAL_BRANCH_FORM_ACTION_STATE,
} from "../validators/branch-management-validation";

type BranchFormServerAction = (
  previousState:
    BranchFormActionState,

  formData: FormData,
) => Promise<BranchFormActionState>;

type BranchFormProps = {
  mode:
    | "CREATE"
    | "EDIT";

  action:
    BranchFormServerAction;

  initialBranch?:
    BranchRecord;
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

function SubmitButton({
  mode,
}: {
  mode:
    | "CREATE"
    | "EDIT";
}) {
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
        ? "Saving Branch..."
        : mode === "CREATE"
          ? "Create Branch"
          : "Save Branch Changes"}
    </button>
  );
}

export function BranchForm({
  mode,
  action,
  initialBranch,
}: BranchFormProps) {
  const [
    state,
    formAction,
  ] = useActionState(
    action,
    INITIAL_BRANCH_FORM_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      {state.status ===
      "ERROR" ? (
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
                Branch Information
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Branch codes and names must be
                unique.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="branchCode"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Branch Code
            </label>

            <input
              id="branchCode"
              name="branchCode"
              type="text"
              className="starland-input mt-2 uppercase"
              defaultValue={
                initialBranch
                  ?.branchCode ?? ""
              }
              maxLength={50}
              autoComplete="off"
              placeholder="MAIN"
              required
            />

            <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
              Letters, numbers, underscores, and
              hyphens only.
            </p>

            <FieldErrors
              errors={
                state.fieldErrors
                  .branchCode
              }
            />
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
              defaultValue={
                initialBranch
                  ?.status ??
                "ACTIVE"
              }
            >
              {BRANCH_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ),
              )}
            </select>

            <FieldErrors
              errors={
                state.fieldErrors
                  .status
              }
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Branch Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              className="starland-input mt-2"
              defaultValue={
                initialBranch
                  ?.name ?? ""
              }
              maxLength={191}
              autoComplete="organization"
              placeholder="Starland Main Branch"
              required
            />

            <FieldErrors
              errors={
                state.fieldErrors.name
              }
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Address
            </label>

            <textarea
              id="address"
              name="address"
              className="starland-input mt-2 min-h-28 resize-y"
              defaultValue={
                initialBranch
                  ?.address ?? ""
              }
              placeholder="Complete branch address"
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  .address
              }
            />
          </div>
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Attendance Geofence
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Coordinates are optional. Latitude
                and longitude must be provided
                together.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-3">
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
              type="number"
              className="starland-input mt-2"
              defaultValue={
                initialBranch
                  ?.latitude ?? ""
              }
              min="-90"
              max="90"
              step="0.0000001"
              placeholder="14.5995123"
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  .latitude
              }
            />
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
              type="number"
              className="starland-input mt-2"
              defaultValue={
                initialBranch
                  ?.longitude ?? ""
              }
              min="-180"
              max="180"
              step="0.0000001"
              placeholder="120.9842195"
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  .longitude
              }
            />
          </div>

          <div>
            <label
              htmlFor="radiusM"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Radius in Meters
            </label>

            <input
              id="radiusM"
              name="radiusM"
              type="number"
              className="starland-input mt-2"
              defaultValue={
                initialBranch
                  ?.radiusM ?? ""
              }
              min="1"
              max="100000"
              step="1"
              placeholder="100"
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  .radiusM
              }
            />
          </div>
        </div>
      </section>

      <section className="starland-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-extrabold text-[var(--starland-dark-text)]">
              {mode === "CREATE"
                ? "Create Organization Branch"
                : "Update Organization Branch"}
            </p>

            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              The operation will create an immutable
              activity-log record.
            </p>
          </div>

          <SubmitButton
            mode={mode}
          />
        </div>
      </section>
    </form>
  );
}