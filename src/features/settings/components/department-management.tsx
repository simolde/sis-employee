"use client";

import { useActionState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import {
  createDepartmentAction,
  updateDepartmentAction,
} from "../server/organization-actions";
import {
  initialOrganizationActionState,
  type DepartmentListItem,
} from "../types/organization-types";

type DepartmentManagementProps = {
  departments: DepartmentListItem[];
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

function DepartmentRow({ department }: { department: DepartmentListItem }) {
  const [state, formAction, isPending] = useActionState(
    updateDepartmentAction,
    initialOrganizationActionState,
  );

  return (
    <tr>
      <td>
        <form action={formAction} className="space-y-3">
          <input
            type="hidden"
            name="departmentId"
            value={department.departmentId}
          />

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

          <div className="grid min-w-[420px] gap-3 sm:grid-cols-[1.4fr_0.8fr_auto]">
            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Department Name
              </label>
              <input
                name="name"
                className="starland-input mt-1"
                defaultValue={department.name}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Department Code
              </label>
              <input
                name="departmentCode"
                className="starland-input mt-2 uppercase"
                placeholder="ACADS"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.departmentCode} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Status
              </label>
              <select
                name="status"
                className="starland-input mt-1"
                defaultValue={department.status}
                disabled={isPending}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <FieldError messages={state.fieldErrors?.status} />
            </div>

            <div className="flex items-end">
              <ConfirmSubmitButton
                type="submit"
                confirmMessage="Save department changes?"
                className="starland-btn starland-btn-primary starland-btn-sm"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </ConfirmSubmitButton>
            </div>
          </div>
        </form>
      </td>
      <td>
        <span
          className={[
            "starland-badge",
            department.status === "ACTIVE"
              ? "starland-badge-success"
              : department.status === "INACTIVE"
                ? "starland-badge-warning"
                : "starland-badge-danger",
          ].join(" ")}
        >
          {department.status}
        </span>
      </td>
      <td>{department.createdAt}</td>
      <td>{department.updatedAt}</td>
    </tr>
  );
}

export function DepartmentManagement({
  departments,
}: DepartmentManagementProps) {
  const [state, formAction, isPending] = useActionState(
    createDepartmentAction,
    initialOrganizationActionState,
  );

  return (
    <div className="space-y-5">
      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <h2 className="text-2xl font-extrabold">Add Department</h2>
          <p className="mt-2 text-sm text-white/70">
            Create departments used for notices, employees, attendance filters,
            and reports.
          </p>
        </div>

        <form action={formAction} className="space-y-4 p-5 sm:p-6">
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

          <div>
            <label className="text-sm font-bold text-[var(--starland-dark-text)]">
              Department Name
            </label>
            <input
              name="name"
              className="starland-input mt-2"
              placeholder="Academics"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.name} />
          </div>

          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Create this department?"
            className="starland-btn starland-btn-primary w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Department
              </>
            )}
          </ConfirmSubmitButton>
        </form>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Departments
          </h2>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {departments.length > 0 ? (
                departments.map((department) => (
                  <DepartmentRow
                    key={department.departmentId}
                    department={department}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No departments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}