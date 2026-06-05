import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudCog,
  Eye,
  LayoutDashboard,
} from "lucide-react";
import type {
  ApprovedLeaveAutomationHistoryFilters,
  ApprovedLeaveAutomationHistoryItem,
  ApprovedLeaveAutomationHistoryResult,
} from "../types/approved-leave-automation-history-types";

type ApprovedLeaveAutomationHistoryTableProps = {
  result: ApprovedLeaveAutomationHistoryResult;
};

function buildPageHref(
  filters: ApprovedLeaveAutomationHistoryFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.executionMode) {
    params.set(
      "executionMode",
      filters.executionMode,
    );
  }

  if (filters.dateFrom) {
    params.set(
      "dateFrom",
      filters.dateFrom,
    );
  }

  if (filters.dateTo) {
    params.set(
      "dateTo",
      filters.dateTo,
    );
  }

  params.set("page", String(page));

  return `/dashboard/attendance/automation/approved-leave-excused/history?${params.toString()}`;
}

function ExecutionModeBadge({
  record,
}: {
  record: ApprovedLeaveAutomationHistoryItem;
}) {
  if (
    record.executionMode === "API"
  ) {
    return (
      <span className="starland-badge starland-badge-info">
        <CloudCog
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
        API / SYSTEM
      </span>
    );
  }

  return (
    <span className="starland-badge starland-badge-success">
      <LayoutDashboard
        className="h-3.5 w-3.5"
        aria-hidden="true"
      />
      DASHBOARD
    </span>
  );
}

function RunStatusBadge({
  status,
}: {
  status:
    ApprovedLeaveAutomationHistoryItem["status"];
}) {
  if (status === "FAILED") {
    return (
      <span className="starland-badge starland-badge-danger">
        FAILED
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className="starland-badge starland-badge-success">
        COMPLETED
      </span>
    );
  }

  return (
    <span className="starland-badge starland-badge-warning">
      UNKNOWN
    </span>
  );
}

export function ApprovedLeaveAutomationHistoryTable({
  result,
}: ApprovedLeaveAutomationHistoryTableProps) {
  return (
    <section className="starland-card overflow-hidden print:shadow-none">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Completed Automation Runs
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Each row summarizes one dashboard or
          protected API automation execution.
        </p>
      </div>

      <div className="starland-scroll-x print:overflow-visible">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Run</th>
              <th>Execution</th>
              <th>Attendance Range</th>
              <th>Processing Results</th>
              <th>Protected / Skipped</th>
              <th>Duration</th>
              <th className="print:hidden">
                Details
              </th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map(
                (record) => (
                  <tr
                    key={
                      record.activityLogId
                    }
                  >
                    <td>
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        Run #
                        {
                          record.activityLogId
                        }
                      </p>

                      <p className="mt-1 max-w-56 break-all text-xs font-semibold text-[var(--starland-muted-text)]">
                        {record.runKey}
                      </p>

                      <div className="mt-2">
                        <RunStatusBadge
                          status={
                            record.status
                          }
                        />
                      </div>

                      <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
                        {record.createdAt}
                      </p>
                    </td>

                    <td>
                      <ExecutionModeBadge
                        record={record}
                      />

                      <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
                        Actor:{" "}
                        {record.actorUserId ??
                          "SYSTEM"}
                      </p>
                    </td>

                    <td>
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        {
                          record.attendanceDateFrom
                        }
                      </p>

                      <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                        through
                      </p>

                      <p className="mt-1 font-bold text-[var(--starland-dark-text)]">
                        {
                          record.attendanceDateTo
                        }
                      </p>

                      <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
                        Limit: {record.limit}
                      </p>
                    </td>

                    <td>
                      <div className="grid min-w-52 grid-cols-2 gap-2">
                        <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-2">
                          <p className="text-xs font-bold text-[var(--starland-muted-text)]">
                            Checked
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
                            {
                              record.checkedCount
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-green-200 bg-green-50 p-2">
                          <p className="text-xs font-bold text-green-700">
                            Generated
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-green-800">
                            {
                              record.generatedCount
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-2">
                          <p className="text-xs font-bold text-[var(--starland-muted-text)]">
                            Existing
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
                            {
                              record.existingAttendanceCount
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-2">
                          <p className="text-xs font-bold text-[var(--starland-muted-text)]">
                            Leave changed
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
                            {
                              record.noApprovedLeaveCount
                            }
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="min-w-44 space-y-2 text-sm font-semibold text-[var(--starland-muted-text)]">
                        <p>
                          Exceptions:{" "}
                          {
                            record.exceptionProtectedCount
                          }
                        </p>

                        <p>
                          Not scheduled:{" "}
                          {
                            record.notScheduledCount
                          }
                        </p>

                        <p>
                          Skipped:{" "}
                          {
                            record.skippedCount
                          }
                        </p>
                      </div>
                    </td>

                    <td>
                      <div className="flex min-w-40 items-start gap-2">
                        <Clock3
                          className="mt-0.5 h-4 w-4 text-[var(--starland-info)]"
                          aria-hidden="true"
                        />

                        <div>
                          <p className="font-bold text-[var(--starland-dark-text)]">
                            {
                              record.durationLabel
                            }
                          </p>

                          <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                            Started:{" "}
                            {record.startedAt}
                          </p>

                          <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                            Finished:{" "}
                            {record.completedAt}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="print:hidden">
                      <Link
                        href={`/dashboard/attendance/automation/approved-leave-excused/history/${record.activityLogId}`}
                        className="starland-btn starland-btn-soft starland-btn-sm"
                      >
                        <Eye
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        View
                      </Link>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No automation runs found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Run the dashboard automation
                      or protected endpoint to
                      create the first history
                      record.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--starland-border)] px-5 py-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--starland-muted-text)]">
          Page {result.pagination.page} of{" "}
          {result.pagination.totalPages} ·{" "}
          {result.pagination.totalItems} run(s)
        </p>

        <div className="flex gap-2">
          <Link
            href={buildPageHref(
              result.filters,
              result.pagination.page - 1,
            )}
            aria-disabled={
              !result.pagination
                .hasPreviousPage
            }
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination
                .hasPreviousPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            <ChevronLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
            Previous
          </Link>

          <Link
            href={buildPageHref(
              result.filters,
              result.pagination.page + 1,
            )}
            aria-disabled={
              !result.pagination
                .hasNextPage
            }
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination
                .hasNextPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            Next
            <ChevronRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}