"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { createLeaveTypeAction } from "../server/leave-type-actions";
import { initialLeaveTypeActionState } from "../types/leave-type-types";

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

export function LeaveTypeForm() {
  const [state, formAction, isPending] = useActionState(
    createLeaveTypeAction,
    initialLeaveTypeActionState,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          HR Setup
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Add Leave Type
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Create leave types and define whether they are paid and whether an
          attachment is required.
        </p>
      </div>

      <form action={formAction} className="space-y-5 p-5 sm:p-6">
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

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Leave Type Name
            </label>
            <input
              id="name"
              name="name"
              className="starland-input mt-2"
              placeholder="Sick Leave"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.name} />
          </div>

          <div>
            <label
              htmlFor="code"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Code
            </label>
            <input
              id="code"
              name="code"
              className="starland-input mt-2 uppercase"
              placeholder="SL"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.code} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-sm font-bold text-[var(--starland-dark-text)]">
            <input
              type="checkbox"
              name="isPaid"
              defaultChecked
              className="h-4 w-4"
              disabled={isPending}
            />
            Paid leave type
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-sm font-bold text-[var(--starland-dark-text)]">
            <input
              type="checkbox"
              name="requiresAttachment"
              className="h-4 w-4"
              disabled={isPending}
            />
            Requires attachment
          </label>
        </div>

        <ConfirmSubmitButton
          type="submit"
          confirmMessage="Create this leave type?"
          className="starland-btn starland-btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Leave Type
            </>
          )}
        </ConfirmSubmitButton>
      </form>
    </section>
  );
}