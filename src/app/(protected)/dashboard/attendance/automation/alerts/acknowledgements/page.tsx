import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  History,
  ShieldCheck,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationAcknowledgementHistoryActions } from "@/features/attendance/automation/alerts/acknowledgements/components/attendance-automation-acknowledgement-history-actions";
import { AttendanceAutomationAcknowledgementHistoryFilters } from "@/features/attendance/automation/alerts/acknowledgements/components/attendance-automation-acknowledgement-history-filters";
import { AttendanceAutomationAcknowledgementHistorySummary } from "@/features/attendance/automation/alerts/acknowledgements/components/attendance-automation-acknowledgement-history-summary";
import { AttendanceAutomationAcknowledgementHistoryTable } from "@/features/attendance/automation/alerts/acknowledgements/components/attendance-automation-acknowledgement-history-table";
import { AttendanceAutomationAcknowledgementPrintHeader } from "@/features/attendance/automation/alerts/acknowledgements/components/attendance-automation-acknowledgement-print-header";
import {
  getAttendanceAutomationAcknowledgementHistoryData,
  parseAttendanceAutomationAcknowledgementHistorySearchParams,
} from "@/features/attendance/automation/alerts/acknowledgements/server/attendance-automation-alert-acknowledgement-history-queries";

export const dynamic = "force-dynamic";

type AttendanceAutomationAcknowledgementHistoryPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

export default async function AttendanceAutomationAcknowledgementHistoryPage({
  searchParams,
}: AttendanceAutomationAcknowledgementHistoryPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseAttendanceAutomationAcknowledgementHistorySearchParams(
      resolvedSearchParams,
    );

  const data =
    await getAttendanceAutomationAcknowledgementHistoryData(
      filters,
    );

  return (
    <section className="starland-page space-y-5">
      <AttendanceAutomationAcknowledgementPrintHeader
        data={data}
      />

      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Alert Audit Trail
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Alert Acknowledgement History
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review, print, and export automation
            alert acknowledgement, expiration,
            replacement, and manual clearing
            activity.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <AttendanceAutomationAcknowledgementHistoryActions
            data={data}
          />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/attendance/automation/alerts"
              className="starland-btn starland-btn-soft"
            >
              <BellRing
                className="h-4 w-4"
                aria-hidden="true"
              />

              Active Alerts
            </Link>

            <Link
              href="/dashboard/attendance/automation"
              className="starland-btn starland-btn-soft"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Automation Overview
            </Link>
          </div>
        </div>
      </div>

      <section className="starland-card overflow-hidden print:hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <History
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Immutable Activity Logs
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Automation Alert Review History
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Acknowledging an alert does not
                resolve its underlying condition.
                This history records who reviewed
                each alert and whether the
                acknowledgement expired, was
                cleared, or was replaced.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              <ShieldCheck
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Active:{" "}
              {
                data.summary
                  .activeAcknowledgements
              }
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Range: {data.filters.dateFrom} to{" "}
              {data.filters.dateTo}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Page: {data.pagination.page} of{" "}
              {data.pagination.totalPages}
            </span>
          </div>
        </div>
      </section>

      <AttendanceAutomationAcknowledgementHistoryFilters
        filters={data.filters}
      />

      <AttendanceAutomationAcknowledgementHistorySummary
        data={data}
      />

      <AttendanceAutomationAcknowledgementHistoryTable
        data={data}
      />

      <section className="hidden border-t border-black pt-4 text-xs print:block">
        <p>
          This report contains the records displayed
          on page {data.pagination.page} of{" "}
          {data.pagination.totalPages}.
        </p>

        <p className="mt-1">
          Total filtered acknowledgement events:{" "}
          {data.pagination.totalRecords}.
        </p>
      </section>
    </section>
  );
}