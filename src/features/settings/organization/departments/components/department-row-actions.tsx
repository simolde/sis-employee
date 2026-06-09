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
  changeDepartmentStatusAction,
  deleteDepartmentAction,
} from "../server/department-management-actions";
import type {
  DepartmentStatus,
} from "../types/department-management-types";

type DepartmentRowActionsProps = {
  departmentId: number;
  departmentName: string;

  status: DepartmentStatus;
};

function confirmArchive(
  event: FormEvent<HTMLFormElement>,
  departmentName: string,
): void {
  const confirmed =
    window.confirm(
      `Archive "${departmentName}"? Employees and notices will remain linked to this department.`,
    );

  if (!confirmed) {
    event.preventDefault();
  }
}

function confirmDelete(
  event: FormEvent<HTMLFormElement>,
  departmentName: string,
): void {
  const confirmed =
    window.confirm(
      `Permanently delete "${departmentName}"? This is allowed only when no employees or notices reference it.`,
    );

  if (!confirmed) {
    event.preventDefault();
  }
}

export function DepartmentRowActions({
  departmentId,
  departmentName,
  status,
}: DepartmentRowActionsProps) {
  return (
    <div className="flex min-w-max flex-wrap gap-2">
      <Link
        href={`/dashboard/settings/organization/departments/${departmentId}/edit`}
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
            changeDepartmentStatusAction
          }
        >
          <input
            type="hidden"
            name="departmentId"
            value={departmentId}
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
            changeDepartmentStatusAction
          }
        >
          <input
            type="hidden"
            name="departmentId"
            value={departmentId}
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
            changeDepartmentStatusAction
          }
          onSubmit={(event) =>
            confirmArchive(
              event,
              departmentName,
            )
          }
        >
          <input
            type="hidden"
            name="departmentId"
            value={departmentId}
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
        action={deleteDepartmentAction}
        onSubmit={(event) =>
          confirmDelete(
            event,
            departmentName,
          )
        }
      >
        <input
          type="hidden"
          name="departmentId"
          value={departmentId}
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