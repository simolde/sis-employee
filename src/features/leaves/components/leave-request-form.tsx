"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { createLeaveRequestAction } from "../server/leave-actions";
import { initialLeaveActionState } from "../types/leave-action-state";
import type { LeaveTypeOption } from "../types/leave-types";
import { LeaveAttachmentUpload } from "./leave-attachment-upload";

type LeaveRequestFormProps = {
  leaveTypes: LeaveTypeOption[];
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

export function LeaveRequestForm({ leaveTypes }: LeaveRequestFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLeaveRequestAction,
    initialLeaveActionState,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          Self-Service
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Submit Leave Request
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Submit your leave request with supporting attachment when required.
          Attachments are uploaded only after the leave form is submitted.
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

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label
              htmlFor="leaveTypeId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Leave Type
            </label>
            <select
              id="leaveTypeId"
              name="leaveTypeId"
              className="starland-input mt-2"
              defaultValue=""
              disabled={isPending}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((leaveType) => (
                <option key={leaveType.leaveTypeId} value={leaveType.leaveTypeId}>
                  {leaveType.name}
                  {leaveType.isPaid ? " · Paid" : " · Unpaid"}
                  {leaveType.requiresAttachment ? " · Attachment required" : ""}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.leaveTypeId} />
          </div>

          <div>
            <label
              htmlFor="dateFrom"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Date From
            </label>
            <input
              id="dateFrom"
              name="dateFrom"
              type="date"
              className="starland-input mt-2"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.dateFrom} />
          </div>

          <div>
            <label
              htmlFor="dateTo"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Date To
            </label>
            <input
              id="dateTo"
              name="dateTo"
              type="date"
              className="starland-input mt-2"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.dateTo} />
          </div>
        </div>

        <div>
          <label
            htmlFor="reason"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            className="starland-input mt-2 min-h-28 resize-y"
            placeholder="Explain the reason for this leave request."
            disabled={isPending}
          />
          <FieldError messages={state.fieldErrors?.reason} />
        </div>

        <LeaveAttachmentUpload
          disabled={isPending}
          errorMessages={state.fieldErrors?.attachment}
        />

        <ConfirmSubmitButton
          type="submit"
          confirmMessage="Submit this leave request? Attachment will be uploaded only after submission."
          className="starland-btn starland-btn-primary w-full"
          disabled={isPending || leaveTypes.length === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Submit Leave Request
            </>
          )}
        </ConfirmSubmitButton>
      </form>
    </section>
  );
}