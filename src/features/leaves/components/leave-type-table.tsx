"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  activateLeaveTypeAction,
  deactivateLeaveTypeAction,
  updateLeaveTypeAction,
} from "../server/leave-type-actions";
import {
  initialLeaveTypeActionState,
  type LeaveTypeListItem,
} from "../types/leave-type-types";

type LeaveTypeTableProps = {
  leaveTypes: LeaveTypeListItem[];
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

function LeaveTypeRow({ leaveType }: { leaveType: LeaveTypeListItem }) {
  const [state, formAction, isPending] = useActionState(
    updateLeaveTypeAction,
    initialLeaveTypeActionState,
  );

  const activateAction = activateLeaveTypeAction.bind(
    null,
    String(leaveType.leaveTypeId),
  );
  const deactivateAction = deactivateLeaveTypeAction.bind(
    null,
    String(leaveType.leaveTypeId),
  );

  return (
    <tr>
      <td>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="leaveTypeId" value={leaveType.leaveTypeId} />

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

          <div className="grid min-w-[520px] gap-3 lg:grid-cols-[1.5fr_0.8fr_0.9fr]">
            <div>
              <label
                htmlFor={`name-${leaveType.leaveTypeId}`}
                className="text-xs font-bold text-[var(--starland-muted-text)]"
              >
                Name
              </label>
              <input
                id={`name-${leaveType.leaveTypeId}`}
                name="name"
                className="starland-input mt-1"
                defaultValue={leaveType.name}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>

            <div>
              <label
                htmlFor={`code-${leaveType.leaveTypeId}`}
                className="text-xs font-bold text-[var(--starland-muted-text)]"
              >
                Code
              </label>
              <input
                id={`code-${leaveType.leaveTypeId}`}
                name="code"
                className="starland-input mt-1 uppercase"
                defaultValue={leaveType.code}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.code} />
            </div>

            <div>
              <label
                htmlFor={`status-${leaveType.leaveTypeId}`}
                className="text-xs font-bold text-[var(--starland-muted-text)]"
              >
                Status
              </label>
              <select
                id={`status-${leaveType.leaveTypeId}`}
                name="status"
                className="starland-input mt-1"
                defaultValue={leaveType.status}
                disabled={isPending}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <FieldError messages={state.fieldErrors?.status} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs font-bold text-[var(--starland-dark-text)]">
              <input
                type="checkbox"
                name="isPaid"
                defaultChecked={leaveType.isPaid}
                disabled={isPending}
              />
              Paid
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs font-bold text-[var(--starland-dark-text)]">
              <input
                type="checkbox"
                name="requiresAttachment"
                defaultChecked={leaveType.requiresAttachment}
                disabled={isPending}
              />
              Requires attachment
            </label>

            <button
              type="submit"
              className="starland-btn starland-btn-primary starland-btn-sm"
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
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </td>

      <td>
        <div className="space-y-2">
          <span
            className={[
              "starland-badge",
              leaveType.status === "ACTIVE"
                ? "starland-badge-success"
                : "starland-badge-danger",
            ].join(" ")}
          >
            {leaveType.status}
          </span>

          <div className="flex flex-wrap gap-1">
            <span className="starland-badge starland-badge-info">
              {leaveType.isPaid ? "PAID" : "UNPAID"}
            </span>

            {leaveType.requiresAttachment ? (
              <span className="starland-badge starland-badge-warning">
                ATTACHMENT
              </span>
            ) : null}
          </div>
        </div>
      </td>

      <td>{leaveType.createdAt}</td>
      <td>{leaveType.updatedAt}</td>

      <td>
        {leaveType.status === "ACTIVE" ? (
          <form action={deactivateAction}>
            <button
              type="submit"
              className="starland-btn starland-btn-danger starland-btn-sm"
            >
              Deactivate
            </button>
          </form>
        ) : (
          <form action={activateAction}>
            <button
              type="submit"
              className="starland-btn starland-btn-primary starland-btn-sm"
            >
              Activate
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}

export function LeaveTypeTable({ leaveTypes }: LeaveTypeTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Leave Types
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Manage paid/unpaid rules and required attachment settings.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Rules</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaveTypes.length > 0 ? (
              leaveTypes.map((leaveType) => (
                <LeaveTypeRow
                  key={leaveType.leaveTypeId}
                  leaveType={leaveType}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No leave types found
                    </p>
                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Create your first leave type using the form above.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}