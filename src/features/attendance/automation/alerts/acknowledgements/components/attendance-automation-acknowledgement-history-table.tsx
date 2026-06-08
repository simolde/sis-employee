import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  History,
} from "lucide-react";
import type {
  AttendanceAutomationAcknowledgementHistoryData,
  AttendanceAutomationAcknowledgementHistoryRecord,
  AttendanceAutomationAcknowledgementHistoryStatus,
} from "../types/attendance-automation-alert-acknowledgement-history-types";

type AttendanceAutomationAcknowledgementHistoryTableProps = {
  data:
    AttendanceAutomationAcknowledgementHistoryData;
};

function statusBadgeClass(
  status:
    AttendanceAutomationAcknowledgementHistoryStatus,
): string {
  switch (status) {
    case "ACTIVE":
      return "starland-badge-success";

    case "EXPIRED":
      return "starland-badge-warning";

    case "CLEARED":
      return "starland-badge-danger";

    case "SUPERSEDED":
      return "starland-badge-info";
  }
}

function actionBadgeClass(
  action:
    AttendanceAutomationAcknowledgementHistoryRecord["action"],
): string {
  return action === "ACKNOWLEDGED"
    ? "starland-badge-success"
    : "starland-badge-danger";
}

function buildPageHref(
  data: AttendanceAutomationAcknowledgementHistoryData,
  page: number,
): string {
  const parameters =
    new URLSearchParams();

  if (data.filters.q) {
    parameters.set(
      "q",
      data.filters.q,
    );
  }

  if (data.filters.action) {
    parameters.set(
      "action",
      data.filters.action,
    );
  }

  if (data.filters.status) {
    parameters.set(
      "status",
      data.filters.status,
    );
  }

  parameters.set(
    "dateFrom",
    data.filters.dateFrom,
  );

  parameters.set(
    "dateTo",
    data.filters.dateTo,
  );

  parameters.set(
    "pageSize",
    String(
      data.filters.pageSize,
    ),
  );

  parameters.set(
    "page",
    String(page),
  );

  return (
    "/dashboard/attendance/automation/alerts/acknowledgements?" +
    parameters.toString()
  );
}

function EventTiming({
  record,
}: {
  record:
    AttendanceAutomationAcknowledgementHistoryRecord;
}) {
  if (record.action === "CLEARED") {
    return (
      <div className="min-w-44">
        <p className="font-bold text-[var(--starland-dark-text)]">
          Cleared
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          {record.clearedAt ??
            record.createdAt}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-52">
      <p className="font-bold text-[var(--starland-dark-text)]">
        {record.durationHours !== null
          ? `${record.durationHours} hour(s)`
          : "Duration unavailable"}
      </p>

      <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
        From:{" "}
        {record.acknowledgedAt ??
          record.createdAt}
      </p>

      <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
        Until:{" "}
        {record.acknowledgedUntil ??
          "No expiration recorded"}
      </p>
    </div>
  );
}

export function AttendanceAutomationAcknowledgementHistoryTable({
  data,
}: AttendanceAutomationAcknowledgementHistoryTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--starland-border)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <History
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Acknowledgement Activity
            </h2>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Showing page{" "}
            {data.pagination.page} of{" "}
            {data.pagination.totalPages}.
          </p>
        </div>

        <Link
          href="/dashboard/attendance/automation/alerts"
          className="starland-btn starland-btn-soft starland-btn-sm print:hidden"
        >
          Open Active Alerts

          <ArrowUpRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Alert</th>
              <th>Action</th>
              <th>Current State</th>
              <th>Administrator</th>
              <th>Duration / Timing</th>
              <th>Note</th>
              <th>Recorded</th>
            </tr>
          </thead>

          <tbody>
            {data.records.length > 0 ? (
              data.records.map(
                (record) => (
                  <tr
                    key={
                      record.activityLogId
                    }
                  >
                    <td>
                      <p className="font-extrabold text-[var(--starland-dark-text)]">
                        #
                        {
                          record.activityLogId
                        }
                      </p>
                    </td>

                    <td>
                      <div className="min-w-56">
                        <p className="font-bold text-[var(--starland-dark-text)]">
                          {record.alertTitle}
                        </p>

                        <code className="mt-1 block break-all text-xs font-semibold text-[var(--starland-muted-text)]">
                          {record.alertCode}
                        </code>

                        <p className="mt-2 text-xs font-bold text-[var(--starland-muted-text)]">
                          Severity:{" "}
                          {
                            record.alertSeverity
                          }
                        </p>
                      </div>
                    </td>

                    <td>
                      <span
                        className={[
                          "starland-badge",
                          actionBadgeClass(
                            record.action,
                          ),
                        ].join(" ")}
                      >
                        {record.action}
                      </span>
                    </td>

                    <td>
                      <span
                        className={[
                          "starland-badge",
                          statusBadgeClass(
                            record.status,
                          ),
                        ].join(" ")}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        {record.actorUserId !==
                        null
                          ? `User #${record.actorUserId}`
                          : "SYSTEM"}
                      </p>
                    </td>

                    <td>
                      <EventTiming
                        record={record}
                      />
                    </td>

                    <td>
                      <p className="max-w-72 whitespace-normal text-sm leading-6 text-[var(--starland-muted-text)]">
                        {record.note ??
                          "No note provided."}
                      </p>
                    </td>

                    <td>
                      <div className="min-w-40">
                        <Clock3
                          className="h-4 w-4 text-[var(--starland-info)]"
                          aria-hidden="true"
                        />

                        <p className="mt-2 text-sm font-semibold text-[var(--starland-dark-text)]">
                          {record.createdAt}
                        </p>
                      </div>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No acknowledgement history found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Adjust the filters or
                      acknowledge an active
                      automation alert.
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
          {data.pagination.totalRecords} matching
          record(s)
        </p>

        <div className="flex flex-wrap gap-2">
          {data.pagination.hasPreviousPage ? (
            <Link
              href={buildPageHref(
                data,
                data.pagination.page - 1,
              )}
              className="starland-btn starland-btn-soft starland-btn-sm"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Previous
            </Link>
          ) : (
            <button
              type="button"
              className="starland-btn starland-btn-soft starland-btn-sm"
              disabled
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Previous
            </button>
          )}

          {data.pagination.hasNextPage ? (
            <Link
              href={buildPageHref(
                data,
                data.pagination.page + 1,
              )}
              className="starland-btn starland-btn-soft starland-btn-sm"
            >
              Next

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <button
              type="button"
              className="starland-btn starland-btn-soft starland-btn-sm"
              disabled
            >
              Next

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      {data.metadata.isPartial ? (
        <div className="border-t border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
          This date range contains more than{" "}
          {data.metadata.maximumScannedRecords}{" "}
          acknowledgement records. Reduce the date
          range for complete filtered totals.
        </div>
      ) : null}
    </section>
  );
}