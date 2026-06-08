import {
  History,
  ShieldCheck,
} from "lucide-react";
import type { AttendanceAutomationAcknowledgementHistoryData } from "../types/attendance-automation-alert-acknowledgement-history-types";

type AttendanceAutomationAcknowledgementPrintHeaderProps = {
  data: AttendanceAutomationAcknowledgementHistoryData;
};

function formatGeneratedAt(): string {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Manila",
    },
  ).format(new Date());
}

function displayFilter(
  value: string,
): string {
  return value || "All";
}

export function AttendanceAutomationAcknowledgementPrintHeader({
  data,
}: AttendanceAutomationAcknowledgementPrintHeaderProps) {
  return (
    <section className="hidden space-y-4 border-b border-black pb-5 print:block">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-6 w-6"
              aria-hidden="true"
            />

            <p className="text-sm font-bold uppercase tracking-wide">
              Starland International School, Inc.
            </p>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold">
            Attendance Automation Alert
            Acknowledgement History
          </h1>

          <p className="mt-2 text-sm">
            Immutable administrator review and
            acknowledgement activity.
          </p>
        </div>

        <History
          className="h-10 w-10"
          aria-hidden="true"
        />
      </div>

      <dl className="grid grid-cols-3 gap-x-6 gap-y-3 text-xs">
        <div>
          <dt className="font-bold uppercase">
            Date Range
          </dt>

          <dd className="mt-1">
            {data.filters.dateFrom} through{" "}
            {data.filters.dateTo}
          </dd>
        </div>

        <div>
          <dt className="font-bold uppercase">
            Action Filter
          </dt>

          <dd className="mt-1">
            {displayFilter(
              data.filters.action,
            )}
          </dd>
        </div>

        <div>
          <dt className="font-bold uppercase">
            State Filter
          </dt>

          <dd className="mt-1">
            {displayFilter(
              data.filters.status,
            )}
          </dd>
        </div>

        <div>
          <dt className="font-bold uppercase">
            Search
          </dt>

          <dd className="mt-1">
            {data.filters.q || "None"}
          </dd>
        </div>

        <div>
          <dt className="font-bold uppercase">
            Printed Page
          </dt>

          <dd className="mt-1">
            Page {data.pagination.page} of{" "}
            {data.pagination.totalPages}
          </dd>
        </div>

        <div>
          <dt className="font-bold uppercase">
            Generated
          </dt>

          <dd className="mt-1">
            {formatGeneratedAt()}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-4 gap-3 text-xs">
        <div className="border border-black p-2">
          <p className="font-bold uppercase">
            Matching Events
          </p>

          <p className="mt-1 text-lg font-extrabold">
            {
              data.summary
                .totalMatchingRecords
            }
          </p>
        </div>

        <div className="border border-black p-2">
          <p className="font-bold uppercase">
            Active
          </p>

          <p className="mt-1 text-lg font-extrabold">
            {
              data.summary
                .activeAcknowledgements
            }
          </p>
        </div>

        <div className="border border-black p-2">
          <p className="font-bold uppercase">
            Expired
          </p>

          <p className="mt-1 text-lg font-extrabold">
            {
              data.summary
                .expiredAcknowledgements
            }
          </p>
        </div>

        <div className="border border-black p-2">
          <p className="font-bold uppercase">
            Cleared
          </p>

          <p className="mt-1 text-lg font-extrabold">
            {
              data.summary
                .clearedAcknowledgements
            }
          </p>
        </div>
      </div>
    </section>
  );
}