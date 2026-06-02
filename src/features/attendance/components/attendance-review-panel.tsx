"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { reviewAttendanceAction } from "../server/attendance-review-actions";
import {
  attendanceReviewStatusValues,
  initialAttendanceReviewActionState,
  type AttendanceReviewStatusValue,
} from "../types/attendance-review-action-state";

type AttendanceReviewPanelProps = {
  attendanceId: number;
  currentStatus: AttendanceReviewStatusValue;
  verifiedBy: string;
  verifiedAt: string;
  approvedBy: string;
  approvedAt: string;
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

function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

export function AttendanceReviewPanel({
  attendanceId,
  currentStatus,
  verifiedBy,
  verifiedAt,
  approvedBy,
  approvedAt,
}: AttendanceReviewPanelProps) {
  const boundAction = reviewAttendanceAction.bind(null, String(attendanceId));
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialAttendanceReviewActionState,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          HR Review
        </span>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Attendance Review
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Update status, verify the attendance record, or approve it after
          checking the selfie, GPS address, and attendance logs.
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label
              htmlFor="status"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Attendance Status
            </label>

            <select
              id="status"
              name="status"
              className="starland-input mt-2"
              defaultValue={currentStatus}
              disabled={isPending}
            >
              {attendanceReviewStatusValues.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>

            <FieldError messages={state.fieldErrors?.status} />
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Verified
            </p>

            <p className="mt-1 text-sm font-extrabold text-[var(--starland-dark-text)]">
              {verifiedBy}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              {verifiedAt}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Approved
            </p>

            <p className="mt-1 text-sm font-extrabold text-[var(--starland-dark-text)]">
              {approvedBy}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              {approvedAt}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Review Guide
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
              Use verify after checking the record. Use approve after final HR
              confirmation.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="reviewNote"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Review Note
          </label>

          <textarea
            id="reviewNote"
            name="reviewNote"
            className="starland-input mt-2 min-h-24"
            placeholder="Optional note for the activity log."
            disabled={isPending}
          />

          <FieldError messages={state.fieldErrors?.reviewNote} />
        </div>

        <FieldError messages={state.fieldErrors?.reviewMode} />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            name="reviewMode"
            value="STATUS_ONLY"
            className="starland-btn starland-btn-secondary"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Update Status
          </button>

          <button
            type="submit"
            name="reviewMode"
            value="VERIFY"
            className="starland-btn starland-btn-primary"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            )}
            Verify
          </button>

          <button
            type="submit"
            name="reviewMode"
            value="APPROVE"
            className="starland-btn starland-btn-primary"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
            Approve
          </button>
        </div>
      </form>
    </section>
  );
}