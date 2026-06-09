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
  changeDesignationStatusAction,
  deleteDesignationAction,
} from "../server/designation-management-actions";
import type {
  DesignationStatus,
} from "../types/designation-management-types";

type DesignationRowActionsProps = {
  designationId: number;
  designationName: string;

  status: DesignationStatus;
};

function confirmArchive(
  event:
    FormEvent<HTMLFormElement>,

  designationName: string,
): void {
  const confirmed =
    window.confirm(
      `Archive "${designationName}"? Existing employee records will remain linked to this designation.`,
    );

  if (!confirmed) {
    event.preventDefault();
  }
}

function confirmDelete(
  event:
    FormEvent<HTMLFormElement>,

  designationName: string,
): void {
  const confirmed =
    window.confirm(
      `Permanently delete "${designationName}"? This is allowed only when no employee record references it.`,
    );

  if (!confirmed) {
    event.preventDefault();
  }
}

export function DesignationRowActions({
  designationId,
  designationName,
  status,
}: DesignationRowActionsProps) {
  return (
    <div className="flex min-w-max flex-wrap gap-2">
      <Link
        href={`/dashboard/settings/organization/designations/${designationId}/edit`}
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
            changeDesignationStatusAction
          }
        >
          <input
            type="hidden"
            name="designationId"
            value={designationId}
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
            changeDesignationStatusAction
          }
        >
          <input
            type="hidden"
            name="designationId"
            value={designationId}
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

      {status !==
      "ARCHIVED" ? (
        <form
          action={
            changeDesignationStatusAction
          }
          onSubmit={(
            event,
          ) =>
            confirmArchive(
              event,
              designationName,
            )
          }
        >
          <input
            type="hidden"
            name="designationId"
            value={designationId}
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
        action={deleteDesignationAction}
        onSubmit={(
          event,
        ) =>
          confirmDelete(
            event,
            designationName,
          )
        }
      >
        <input
          type="hidden"
          name="designationId"
          value={designationId}
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