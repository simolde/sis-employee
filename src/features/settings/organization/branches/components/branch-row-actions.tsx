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
  changeBranchStatusAction,
  deleteBranchAction,
} from "../server/branch-management-actions";
import type {
  BranchStatus,
} from "../types/branch-management-types";

type BranchRowActionsProps = {
  branchId: number;
  branchName: string;

  status:
    BranchStatus;
};

function confirmArchive(
  event:
    FormEvent<HTMLFormElement>,

  branchName: string,
): void {
  const confirmed =
    window.confirm(
      `Archive "${branchName}"? Employees and attendance records will remain linked to this branch.`,
    );

  if (!confirmed) {
    event.preventDefault();
  }
}

function confirmDelete(
  event:
    FormEvent<HTMLFormElement>,

  branchName: string,
): void {
  const confirmed =
    window.confirm(
      `Permanently delete "${branchName}"? This is allowed only when no records reference the branch.`,
    );

  if (!confirmed) {
    event.preventDefault();
  }
}

export function BranchRowActions({
  branchId,
  branchName,
  status,
}: BranchRowActionsProps) {
  return (
    <div className="flex min-w-max flex-wrap gap-2">
      <Link
        href={`/dashboard/settings/organization/branches/${branchId}/edit`}
        className="starland-btn starland-btn-soft starland-btn-sm"
      >
        <Pencil
          className="h-4 w-4"
          aria-hidden="true"
        />

        Edit
      </Link>

      {status !==
      "ACTIVE" ? (
        <form
          action={
            changeBranchStatusAction
          }
        >
          <input
            type="hidden"
            name="branchId"
            value={branchId}
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
            changeBranchStatusAction
          }
        >
          <input
            type="hidden"
            name="branchId"
            value={branchId}
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
            changeBranchStatusAction
          }
          onSubmit={(
            event,
          ) =>
            confirmArchive(
              event,
              branchName,
            )
          }
        >
          <input
            type="hidden"
            name="branchId"
            value={branchId}
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
        action={deleteBranchAction}
        onSubmit={(
          event,
        ) =>
          confirmDelete(
            event,
            branchName,
          )
        }
      >
        <input
          type="hidden"
          name="branchId"
          value={branchId}
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