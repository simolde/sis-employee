"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  initialUpdateEmployeeActionState,
  updateEmployeeAction,
} from "../server/employee-actions";
import type {
  EmployeeEditFormData,
  EmployeeFormOptions,
} from "../types/employee-types";
import { EmployeeFormFields } from "./employee-form-fields";

type EmployeeEditFormProps = {
  employee: EmployeeEditFormData;
  options: EmployeeFormOptions;
};

export function EmployeeEditForm({
  employee,
  options,
}: EmployeeEditFormProps) {
  const updateAction = updateEmployeeAction.bind(null, String(employee.empId));

  const [state, formAction, isPending] = useActionState(
    updateAction,
    initialUpdateEmployeeActionState,
  );

  return (
    <form action={formAction} className="starland-card space-y-8 p-5 sm:p-6">
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

      <EmployeeFormFields
        options={options}
        fieldErrors={state.fieldErrors}
        disabled={isPending}
        values={employee}
      />

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--starland-border)] pt-5 sm:flex-row sm:justify-end">
        <Link
          href={`/dashboard/employees/${employee.empId}`}
          className="starland-btn starland-btn-secondary"
          aria-disabled={isPending}
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Update Employee
            </>
          )}
        </button>
      </div>
    </form>
  );
}