"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { updateEmployeeAction } from "../server/employee-actions";
import { EmployeeSetupSelects } from "./employee-setup-selects";
import type { EmployeeFormOptions } from "../types/employee-form-options-types";

type EmployeeActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type EmployeeEditFormEmployee = {
  empId: number | string;
  branchId?: number | string | null;
  departmentId?: number | string | null;
  designationId?: number | string | null;
  empTypeId?: number | string | null;
  [key: string]: unknown;
};

type EmployeeEditFormProps = {
  employee: EmployeeEditFormEmployee;
  options: EmployeeFormOptions;
};

const initialEmployeeActionState: EmployeeActionState = {
  ok: false,
  message: "",
};

const visibleWorkAssignmentFields = new Set([
  "branchId",
  "departmentId",
  "designationId",
  "empTypeId",
]);

function toOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function isHiddenFieldValue(value: unknown): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function shouldRenderHiddenField(key: string, value: unknown): boolean {
  if (key === "empId") {
    return false;
  }

  if (visibleWorkAssignmentFields.has(key)) {
    return false;
  }

  return isHiddenFieldValue(value);
}

function hiddenValue(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function EmployeeEditForm({
  employee,
  options,
}: EmployeeEditFormProps) {
  const updateAction = updateEmployeeAction.bind(null, String(employee.empId));
  const [state, formAction, isPending] = useActionState(
    updateAction,
    initialEmployeeActionState,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          Employee Editor
        </span>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Update Employee
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Update the employee work assignment using active setup records from
          Settings.
        </p>
      </div>

      <form action={formAction} className="space-y-5 p-5 sm:p-6">
        {Object.entries(employee).map(([key, value]) => {
          if (!shouldRenderHiddenField(key, value)) {
            return null;
          }

          if (!isHiddenFieldValue(value)) {
            return null;
          }

          return (
            <input
              key={key}
              type="hidden"
              name={key}
              value={hiddenValue(value)}
            />
          );
        })}

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

        <EmployeeSetupSelects
          options={options}
          defaultValues={{
            branchId: toOptionalNumber(employee.branchId),
            departmentId: toOptionalNumber(employee.departmentId),
            designationId: toOptionalNumber(employee.designationId),
            empTypeId: toOptionalNumber(employee.empTypeId),
          }}
          disabled={isPending}
          fieldErrors={state.fieldErrors}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/dashboard/employees/${employee.empId}`}
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Profile
          </Link>

          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Save employee changes?"
            className="starland-btn starland-btn-primary"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save Employee
              </>
            )}
          </ConfirmSubmitButton>
        </div>
      </form>
    </section>
  );
}