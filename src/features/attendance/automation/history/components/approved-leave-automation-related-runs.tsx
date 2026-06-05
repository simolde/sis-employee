import Link from "next/link";
import {
  ArrowUpRight,
  GitBranch,
  RotateCcw,
} from "lucide-react";
import type {
  ApprovedLeaveAutomationHistoryItem,
  ApprovedLeaveAutomationRelatedRuns,
} from "../types/approved-leave-automation-history-types";

type ApprovedLeaveAutomationRelatedRunsProps = {
  currentRunId: number;
  relatedRuns: ApprovedLeaveAutomationRelatedRuns;
};

function statusBadgeClass(
  status: ApprovedLeaveAutomationHistoryItem["status"],
): string {
  if (status === "FAILED") {
    return "starland-badge-danger";
  }

  if (status === "COMPLETED") {
    return "starland-badge-success";
  }

  return "starland-badge-warning";
}

function RelatedRunRow({
  label,
  run,
}: {
  label: string;
  run: ApprovedLeaveAutomationHistoryItem;
}) {
  return (
    <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
            {label}
          </p>

          <p className="mt-2 font-extrabold text-[var(--starland-dark-text)]">
            Run #{run.activityLogId}
          </p>

          <p className="mt-1 max-w-xl break-all text-xs font-semibold text-[var(--starland-muted-text)]">
            {run.runKey}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={[
                "starland-badge",
                statusBadgeClass(run.status),
              ].join(" ")}
            >
              {run.status}
            </span>

            <span className="starland-badge starland-badge-info">
              {run.executionMode}
            </span>
          </div>

          <p className="mt-3 text-xs font-semibold text-[var(--starland-muted-text)]">
            Generated: {run.generatedCount} · Checked:{" "}
            {run.checkedCount} · Created: {run.createdAt}
          </p>
        </div>

        <Link
          href={`/dashboard/attendance/automation/approved-leave-excused/history/${run.activityLogId}`}
          className="starland-btn starland-btn-soft starland-btn-sm"
        >
          <ArrowUpRight
            className="h-4 w-4"
            aria-hidden="true"
          />
          Open Run
        </Link>
      </div>
    </article>
  );
}

export function ApprovedLeaveAutomationRelatedRuns({
  currentRunId,
  relatedRuns,
}: ApprovedLeaveAutomationRelatedRunsProps) {
  const hasRelatedRuns = Boolean(
    relatedRuns.parentRun ||
      relatedRuns.retryRuns.length > 0,
  );

  return (
    <section className="starland-card overflow-hidden print:shadow-none">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <GitBranch
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Retry Lineage
          </h2>
        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Shows the original failed run and direct retries connected to run #
          {currentRunId}.
        </p>
      </div>

      <div className="space-y-4 p-5">
        {relatedRuns.parentRun ? (
          <RelatedRunRow
            label="Original Run"
            run={relatedRuns.parentRun}
          />
        ) : null}

        {relatedRuns.retryRuns.map(
          (run, index) => (
            <RelatedRunRow
              key={run.activityLogId}
              label={`Retry Attempt ${index + 1}`}
              run={run}
            />
          ),
        )}

        {!hasRelatedRuns ? (
          <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
            <RotateCcw
              className="mx-auto h-7 w-7 text-[var(--starland-muted-text)]"
              aria-hidden="true"
            />

            <p className="mt-3 font-bold text-[var(--starland-dark-text)]">
              No retry relationship
            </p>

            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              This run was not created as a retry and currently has no direct
              retry attempts.
            </p>
          </div>
        ) : null}

        {relatedRuns.isPartial ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Only the most recent 1,000 automation runs were scanned. Older
            retry relationships may not be displayed.
          </div>
        ) : null}
      </div>
    </section>
  );
}