"use client";

import type {
  FormEvent,
} from "react";
import Link from "next/link";
import {
  Archive,
  CheckCircle2,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import {
  changeEmployeeTypeStatusAction,
  deleteEmployeeTypeAction,
} from "../server/employee-type-management-actions";
import type {
  EmployeeTypeStatus,
} from "../types/employee-type-management-types";

type EmployeeTypeRowActionsProps = {
  empTypeId: number;
  employeeTypeName: string;

  status: EmployeeTypeStatus;
};

function confirmArchive(
  event: FormEvent<HTMLFormElement>,
  employeeTypeName: string,
): void {
  const confirmed =
    window.confirm(
      `Archive "${employeeTypeName}"? Existing employee records will remain linked to this employee type.`,
    );

  if (!confirmed) {
    event.preventDefault();
  }
}

function confirmDelete(
  event: FormEvent<HTMLFormElement>,
  employeeTypeName: string,
): void {
  const confirmed =
    window.confirm(
      `Permanently delete "${employeeTypeName}"? This is allowed only when no employee record references it.`,
    );

  if (!confirmed) {
    event.preventDefault();
  }
}

export function EmployeeTypeRowActions({
  empTypeId,
  employeeTypeName,
  status,
}: EmployeeTypeRowActionsProps) {
  return (
    <div className="flex min-w-max flex-wrap gap-2">
      <Link
        href={`/dashboard/settings/organization/employee-types/${empTypeId}/edit`}
        className="starland-btn starland-btn-soft starland-btn-sm"
      >
        <Pencil
          className="h-4 w-4"
          aria-hidden="true"
        />

        Edit
      </Link>

      {status !== "ACTIVE" ? (
        <form
          action={
            changeEmployeeTypeStatusAction
          }
        >
          <input
            type="hidden"
            name="empTypeId"
            value={empTypeId}
          />

          <input
            type="hidden"
            name="status"
            value="ACTIVE"
          />

          <button
            type="submit"
            className="starland-btn starland-btn-soft starland-btn-sm"
          >
            <CheckCircle2
              className="h-4 w-4"
              aria-hidden="true"
            />

            Activate
          </button>
        </form>
      ) : (
        <form
          action={
            changeEmployeeTypeStatusAction
          }
        >
          <input
            type="hidden"
            name="empTypeId"
            value={empTypeId}
          />

          <input
            type="hidden"
            name="status"
            value="INACTIVE"
          />

          <button
            type="submit"
            className="starland-btn starland-btn-soft starland-btn-sm"
          >
            <Power
              className="h-4 w-4"
              aria-hidden="true"
            />

            Deactivate
          </button>
        </form>
      )}

      {status !== "ARCHIVED" ? (
        <form
          action={
            changeEmployeeTypeStatusAction
          }
          onSubmit={(event) =>
            confirmArchive(
              event,
              employeeTypeName,
            )
          }
        >
          <input
            type="hidden"
            name="empTypeId"
            value={empTypeId}
          />

          <input
            type="hidden"
            name="status"
            value="ARCHIVED"
          />

          <button
            type="submit"
            className="starland-btn starland-btn-soft starland-btn-sm"
          >
            <Archive
              className="h-4 w-4"
              aria-hidden="true"
            />

            Archive
          </button>
        </form>
      ) : null}

      <form
        action={deleteEmployeeTypeAction}
        onSubmit={(event) =>
          confirmDelete(
            event,
            employeeTypeName,
          )
        }
      >
        <input
          type="hidden"
          name="empTypeId"
          value={empTypeId}
        />

        <button
          type="submit"
          className="starland-btn starland-btn-danger starland-btn-sm"
        >
          <Trash2
            className="h-4 w-4"
            aria-hidden="true"
          />

          Delete
        </button>
      </form>
    </div>
  );
}