"use client";

import { useActionState } from "react";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { bulkUpdateOdlAccessAction } from "../server/odl-access-bulk-actions";
import {
  initialOdlAccessBulkActionState,
  type OdlAccessBulkFilters,
  type OdlAccessBulkPreview,
} from "../types/odl-access-bulk-types";

type OdlAccessBulkActionPanelProps = {
  filters: OdlAccessBulkFilters;
  preview: OdlAccessBulkPreview;
  limit: number;
};

function HiddenFilters({ filters }: { filters: OdlAccessBulkFilters }) {
  return (
    <>
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="branchId" value={filters.branchId} />
      <input type="hidden" name="departmentId" value={filters.departmentId} />
      <input type="hidden" name="designationId" value={filters.designationId} />
      <input type="hidden" name="empTypeId" value={filters.empTypeId} />
      <input type="hidden" name="scheduleId" value={filters.scheduleId} />
      <input type="hidden" name="access" value={filters.access} />
      <input
        type="hidden"
        name="activeOnly"
        value={filters.activeOnly ? "true" : "false"}
      />
    </>
  );
}

export function OdlAccessBulkActionPanel({
  filters,
  preview,
  limit,
}: OdlAccessBulkActionPanelProps) {
  const [state, formAction, isPending] = useActionState(
    bulkUpdateOdlAccessAction,
    initialOdlAccessBulkActionState,
  );

  return (
    <section className="starland-card p-5">
      <div>
        <span className="starland-badge starland-badge-warning">
          Bulk Update
        </span>

        <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
          Apply ODL Access to Matching Employees
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          This updates the existing Flexible flag. Employees already matching
          the target state are skipped. Maximum records per run: {limit}.
        </p>
      </div>

      {!preview.hasSpecificFilters ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          No specific filter is selected. Tick the confirmation box below if you
          intentionally want to apply the action to all employees.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form action={formAction} className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <HiddenFilters filters={filters} />
          <input type="hidden" name="mode" value="ENABLE" />
          <input type="hidden" name="limit" value={limit} />

          {!preview.hasSpecificFilters ? (
            <label className="mb-4 flex items-start gap-2 text-sm font-semibold text-[var(--starland-dark-text)]">
              <input name="confirmAll" type="checkbox" className="mt-1" />
              I understand this may enable ODL access for all matching employees.
            </label>
          ) : null}

          <p className="text-sm font-bold text-[var(--starland-dark-text)]">
            Enable ODL Access
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Will enable up to {Math.min(preview.wouldEnableCount, limit)} of{" "}
            {preview.wouldEnableCount} currently disabled matching employee(s).
          </p>

          <button
            type="submit"
            className="starland-btn starland-btn-primary mt-4"
            disabled={isPending || preview.wouldEnableCount === 0}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            )}
            Enable Matching
          </button>
        </form>

        <form action={formAction} className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <HiddenFilters filters={filters} />
          <input type="hidden" name="mode" value="DISABLE" />
          <input type="hidden" name="limit" value={limit} />

          {!preview.hasSpecificFilters ? (
            <label className="mb-4 flex items-start gap-2 text-sm font-semibold text-[var(--starland-dark-text)]">
              <input name="confirmAll" type="checkbox" className="mt-1" />
              I understand this may disable ODL access for all matching
              employees.
            </label>
          ) : null}

          <p className="text-sm font-bold text-[var(--starland-dark-text)]">
            Disable ODL Access
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Will disable up to {Math.min(preview.wouldDisableCount, limit)} of{" "}
            {preview.wouldDisableCount} currently enabled matching employee(s).
          </p>

          <button
            type="submit"
            className="starland-btn starland-btn-soft mt-4"
            disabled={isPending || preview.wouldDisableCount === 0}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldX className="h-4 w-4" aria-hidden="true" />
            )}
            Disable Matching
          </button>
        </form>
      </div>

      {state.message ? (
        <div
          className={[
            "mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
            state.ok
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {state.message}
        </div>
      ) : null}
    </section>
  );
}