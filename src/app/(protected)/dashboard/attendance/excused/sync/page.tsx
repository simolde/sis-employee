import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  History,
  RefreshCw,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ApprovedLeaveExcusedAutomationFilters } from "@/features/attendance/automation/components/approved-leave-excused-automation-filters";
import { ApprovedLeaveExcusedAutomationPanel } from "@/features/attendance/automation/components/approved-leave-excused-automation-panel";
import { ApprovedLeaveExcusedSyncTable } from "@/features/attendance/excused/sync/components/approved-leave-excused-sync-table";
import {
  getApprovedLeaveExcusedSyncData,
  parseApprovedLeaveExcusedSyncSearchParams,
} from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-queries";

export const dynamic = "force-dynamic";

type ApprovedLeaveExcusedSyncPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

function getManilaDateInputValue(
  offsetDays = 0,
): string {
  const now = new Date();

  const targetDate = new Date(
    now.getTime() +
      offsetDays * 24 * 60 * 60 * 1000,
  );

  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(targetDate);

  const year =
    parts.find(
      (part) => part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) => part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) => part.type === "day",
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function hasSearchParam(
  value:
    | string
    | string[]
    | undefined,
): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(value);
}

export default async function ApprovedLeaveExcusedSyncPage({
  searchParams,
}: ApprovedLeaveExcusedSyncPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const normalizedSearchParams = {
    ...resolvedSearchParams,

    dateFrom: hasSearchParam(
      resolvedSearchParams.dateFrom,
    )
      ? resolvedSearchParams.dateFrom
      : getManilaDateInputValue(-30),

    dateTo: hasSearchParam(
      resolvedSearchParams.dateTo,
    )
      ? resolvedSearchParams.dateTo
      : getManilaDateInputValue(),
  };

  const filters =
    parseApprovedLeaveExcusedSyncSearchParams(
      normalizedSearchParams,
    );

  const result =
    await getApprovedLeaveExcusedSyncData(
      filters,
    );

  const secretConfigured = Boolean(
    process.env
      .ATTENDANCE_AUTOMATION_SECRET?.trim() ||
      process.env.CRON_SECRET?.trim(),
  );

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Approved Leave Synchronization
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Approved Leave to EXCUSED
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Preview approved leave dates that are
            missing corresponding EXCUSED
            attendance records. Existing
            attendance, exception dates, and
            non-scheduled dates remain protected.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/approved-leave-excused"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Automation
          </Link>

          <Link
            href="/dashboard/attendance/automation/approved-leave-excused/history"
            className="starland-btn starland-btn-soft"
          >
            <History
              className="h-4 w-4"
              aria-hidden="true"
            />

            Run History
          </Link>

          <Link
            href="/dashboard/attendance/excused"
            className="starland-btn starland-btn-soft"
          >
            <CalendarCheck
              className="h-4 w-4"
              aria-hidden="true"
            />

            EXCUSED Records
          </Link>

          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Attendance Actions
          </Link>
        </div>
      </div>

      <ApprovedLeaveExcusedAutomationFilters
        filters={result.filters}
        options={result.options}
      />

      <ApprovedLeaveExcusedAutomationPanel
        result={result}
        secretConfigured={
          secretConfigured
        }
        maximumRecords={500}
      />

      <ApprovedLeaveExcusedSyncTable
        result={result}
      />
    </section>
  );
}