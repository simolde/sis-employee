"use client";

import { useActionState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import {
  createDesignationAction,
  updateDesignationAction,
} from "../server/employment-setup-actions";
import {
  initialEmploymentSetupActionState,
  type DesignationListItem,
} from "../types/employment-setup-types";

type DesignationManagementProps = {
  designations: DesignationListItem[];
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

function DesignationRow({ designation }: { designation: DesignationListItem }) {
  const [state, formAction, isPending] = useActionState(
    updateDesignationAction,
    initialEmploymentSetupActionState,
  );

  return (
    <tr>
      <td>
        <form action={formAction} className="space-y-3">
          <input
            type="hidden"
            name="designationId"
            value={designation.designationId}
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

          <div className="grid min-w-[560px] gap-3 sm:grid-cols-[0.7fr_1.3fr_0.8fr_auto]">
            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Code
              </label>
              <input
                name="designationCode"
                className="starland-input mt-1 uppercase"
                defaultValue={designation.designationCode}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.designationCode} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Designation Name
              </label>
              <input
                name="name"
                className="starland-input mt-1"
                defaultValue={designation.name}
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--starland-muted-text)]">
                Status
              </label>
              <select
                name="status"
                className="starland-input mt-1"
                defaultValue={designation.status}
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
                confirmMessage="Save designation changes?"
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
            designation.status === "ACTIVE"
              ? "starland-badge-success"
              : designation.status === "INACTIVE"
                ? "starland-badge-warning"
                : "starland-badge-danger",
          ].join(" ")}
        >
          {designation.status}
        </span>
      </td>
      <td>{designation.createdAt}</td>
      <td>{designation.updatedAt}</td>
    </tr>
  );
}

export function DesignationManagement({
  designations,
}: DesignationManagementProps) {
  const [state, formAction, isPending] = useActionState(
    createDesignationAction,
    initialEmploymentSetupActionState,
  );

  return (
    <div className="space-y-5">
      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <h2 className="text-2xl font-extrabold">Add Designation</h2>
          <p className="mt-2 text-sm text-white/70">
            Create job titles used in employee profiles and reports.
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

          <div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr]">
            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Designation Code
              </label>
              <input
                name="designationCode"
                className="starland-input mt-2 uppercase"
                placeholder="TEACHER"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.designationCode} />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--starland-dark-text)]">
                Designation Name
              </label>
              <input
                name="name"
                className="starland-input mt-2"
                placeholder="Teacher"
                disabled={isPending}
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>
          </div>

          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Create this designation?"
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
                Create Designation
              </>
            )}
          </ConfirmSubmitButton>
        </form>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Designations
          </h2>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Designation</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {designations.length > 0 ? (
                designations.map((designation) => (
                  <DesignationRow
                    key={designation.designationId}
                    designation={designation}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No designations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}