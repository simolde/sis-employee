"use client";

import { useActionState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { createNoticeAction } from "../server/notice-actions";
import {
  initialNoticeActionState,
  type NoticeTargetOption,
} from "../types/notice-types";

type NoticeFormProps = {
  branchOptions: NoticeTargetOption[];
  departmentOptions: NoticeTargetOption[];
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

export function NoticeForm({
  branchOptions,
  departmentOptions,
}: NoticeFormProps) {
  const [state, formAction, isPending] = useActionState(
    createNoticeAction,
    initialNoticeActionState,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          Announcement
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Create Notice
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Publish announcements by role audience, branch, department, or a
          combination of all three.
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

        <div>
          <label
            htmlFor="title"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            className="starland-input mt-2"
            placeholder="Important Announcement"
            disabled={isPending}
          />
          <FieldError messages={state.fieldErrors?.title} />
        </div>

        <div>
          <label
            htmlFor="body"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Body
          </label>
          <textarea
            id="body"
            name="body"
            className="starland-input mt-2 min-h-36 resize-y"
            placeholder="Write the full announcement here."
            disabled={isPending}
          />
          <FieldError messages={state.fieldErrors?.body} />
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label
              htmlFor="audience"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Audience
            </label>
            <select
              id="audience"
              name="audience"
              className="starland-input mt-2"
              defaultValue="ALL"
              disabled={isPending}
            >
              <option value="ALL">All Roles</option>
              <option value="HR_ADMIN">HR / Admin</option>
              <option value="HEADS">Heads</option>
              <option value="STAFF_FACULTY_MAINTENANCE">
                Staff / Faculty / Maintenance
              </option>
            </select>
            <FieldError messages={state.fieldErrors?.audience} />
          </div>

          <div>
            <label
              htmlFor="branchId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Branch Target
            </label>
            <select
              id="branchId"
              name="branchId"
              className="starland-input mt-2"
              defaultValue=""
              disabled={isPending}
            >
              <option value="">All Branches</option>
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.branchId} />
          </div>

          <div>
            <label
              htmlFor="departmentId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Department Target
            </label>
            <select
              id="departmentId"
              name="departmentId"
              className="starland-input mt-2"
              defaultValue=""
              disabled={isPending}
            >
              <option value="">All Departments</option>
              {departmentOptions.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.departmentId} />
          </div>

          <div>
            <label
              htmlFor="expiresAt"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Expires At
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              className="starland-input mt-2"
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.expiresAt} />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-sm font-bold text-[var(--starland-dark-text)]">
          <input
            type="checkbox"
            name="publishNow"
            className="h-4 w-4"
            disabled={isPending}
          />
          Publish immediately
        </label>

        <ConfirmSubmitButton
          type="submit"
          confirmMessage="Create this notice?"
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
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              Create Notice
            </>
          )}
        </ConfirmSubmitButton>
      </form>
    </section>
  );
}