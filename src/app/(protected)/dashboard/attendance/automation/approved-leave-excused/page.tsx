import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ApprovedLeaveExcusedAutomationFilters } from "@/features/attendance/automation/components/approved-leave-excused-automation-filters";
import { ApprovedLeaveExcusedAutomationPanel } from "@/features/attendance/automation/components/approved-leave-excused-automation-panel";
import { ApprovedLeaveExcusedSyncTable } from "@/features/attendance/excused/sync/components/approved-leave-excused-sync-table";
import {
  getApprovedLeaveExcusedSyncData,
  parseApprovedLeaveExcusedSyncSearchParams,
} from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-queries";

type ApprovedLeaveExcusedAutomationPageProps = {
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

export default async function ApprovedLeaveExcusedAutomationPage({
  searchParams,
}: ApprovedLeaveExcusedAutomationPageProps) {
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

  const maximumRecords = 500;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Attendance Automation
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Approved-Leave EXCUSED
            Automation
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Preview and run the same approved-leave
            attendance process used by the
            protected automation endpoint.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/excused"
            className="starland-btn starland-btn-primary"
          >
            <CalendarCheck
              className="h-4 w-4"
              aria-hidden="true"
            />

            EXCUSED Records
          </Link>

          <Link
            href="/dashboard/attendance/exceptions"
            className="starland-btn starland-btn-soft"
          >
            <CalendarDays
              className="h-4 w-4"
              aria-hidden="true"
            />

            Exception Calendar
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

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Automation Preview
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Approved Leave to EXCUSED
            Attendance
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            The system expands approved leave into
            scheduled attendance dates, protects
            exception-calendar dates, preserves
            existing attendance, and generates only
            missing EXCUSED records.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Approved Leaves
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .matchingApprovedLeaves
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <RefreshCw className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Missing EXCUSED
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .missingExcusedCandidates
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Existing Attendance
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .alreadyHasAttendance
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Evaluated Dates
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .evaluatedLeaveDates
              }
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Exception Protected
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .exceptionProtected
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Not Scheduled
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.notScheduled}
            </p>
          </article>
        </div>
      </section>

      <ApprovedLeaveExcusedAutomationFilters
        filters={result.filters}
        options={result.options}
      />

      <ApprovedLeaveExcusedAutomationPanel
        result={result}
        secretConfigured={secretConfigured}
        maximumRecords={maximumRecords}
      />

      <ApprovedLeaveExcusedSyncTable
        result={result}
      />
    </section>
  );
}