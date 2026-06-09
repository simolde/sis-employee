"use client";

import {
  useActionState,
} from "react";
import {
  Save,
  UsersRound,
} from "lucide-react";
import {
  useFormStatus,
} from "react-dom";
import {
  EMPLOYEE_TYPE_STATUSES,
  type EmployeeTypeFormActionState,
  type EmployeeTypeRecord,
} from "../types/employee-type-management-types";
import { INITIAL_EMPLOYEE_TYPE_FORM_ACTION_STATE } from "../validators/employee-type-management-validation";

type EmployeeTypeFormServerAction = (
  previousState:
    EmployeeTypeFormActionState,

  formData: FormData,
) => Promise<EmployeeTypeFormActionState>;

type EmployeeTypeFormProps = {
  mode:
    | "CREATE"
    | "EDIT";

  action: EmployeeTypeFormServerAction;

  initialEmployeeType?:
    EmployeeTypeRecord;
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
      {errors.map((error) => (
        <p
          key={error}
          className="text-xs font-semibold text-red-700"
        >
          {error}
        </p>
      ))}
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
  const { pending } =
    useFormStatus();

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
        ? "Saving Employee Type..."
        : mode === "CREATE"
          ? "Create Employee Type"
          : "Save Employee Type Changes"}
    </button>
  );
}

export function EmployeeTypeForm({
  mode,
  action,
  initialEmployeeType,
}: EmployeeTypeFormProps) {
  const [
    state,
    formAction,
  ] = useActionState(
    action,
    INITIAL_EMPLOYEE_TYPE_FORM_ACTION_STATE,
  );

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
            <UsersRound
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Employee Type Information
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Employee type codes and names must be
                unique.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="empTypeCode"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Employee Type Code
            </label>

            <input
              id="empTypeCode"
              name="empTypeCode"
              type="text"
              className="starland-input mt-2 uppercase"
              defaultValue={
                initialEmployeeType
                  ?.empTypeCode ?? ""
              }
              maxLength={50}
              autoComplete="off"
              placeholder="REG"
              required
            />

            <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
              Letters, numbers, underscores, and
              hyphens only.
            </p>

            <FieldErrors
              errors={
                state.fieldErrors
                  .empTypeCode
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
                initialEmployeeType
                  ?.status ?? "ACTIVE"
              }
            >
              {EMPLOYEE_TYPE_STATUSES.map(
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
                state.fieldErrors.status
              }
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Employee Type Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              className="starland-input mt-2"
              defaultValue={
                initialEmployeeType
                  ?.name ?? ""
              }
              maxLength={191}
              autoComplete="off"
              placeholder="Regular Employee"
              required
            />

            <FieldErrors
              errors={
                state.fieldErrors.name
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
                ? "Create Employment Classification"
                : "Update Employment Classification"}
            </p>

            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              This operation creates an immutable
              activity-log record.
            </p>
          </div>

          <SubmitButton mode={mode} />
        </div>
      </section>
    </form>
  );
}