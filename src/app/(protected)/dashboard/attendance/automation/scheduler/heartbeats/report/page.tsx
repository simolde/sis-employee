import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  HeartPulse,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationCronReceiptReportDashboard } from "@/features/attendance/automation/scheduler/heartbeats/report/components/attendance-automation-cron-receipt-report-dashboard";
import {
  getAttendanceAutomationCronReceiptReportData,
  parseAttendanceAutomationCronReceiptReportSearchParams,
} from "@/features/attendance/automation/scheduler/heartbeats/report/server/attendance-automation-cron-receipt-report-queries";

export const dynamic = "force-dynamic";

type AttendanceAutomationCronReceiptReportPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

export default async function AttendanceAutomationCronReceiptReportPage({
  searchParams,
}: AttendanceAutomationCronReceiptReportPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseAttendanceAutomationCronReceiptReportSearchParams(
      resolvedSearchParams,
    );

  const data =
    await getAttendanceAutomationCronReceiptReportData(
      filters,
    );

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Hostinger Cron Analytics
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Cron Receipt Coverage Report
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review daily Hostinger cron execution
            coverage, timing, outcomes, HTTP
            responses, and execution duration using
            authenticated V2 scheduler receipts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/scheduler/heartbeats"
            className="starland-btn starland-btn-primary"
          >
            <HeartPulse
              className="h-4 w-4"
              aria-hidden="true"
            />

            Cron Receipts
          </Link>

          <Link
            href="/dashboard/attendance/automation/scheduler"
            className="starland-btn starland-btn-soft"
          >
            <CalendarClock
              className="h-4 w-4"
              aria-hidden="true"
            />

            Scheduler Setup
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

      <section className="starland-card overflow-hidden print:hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <BarChart3
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                V2 Receipt History
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Daily Cron Execution Coverage
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Missing or failed receipts are
                classified as critical. Successful
                receipts outside the expected
                scheduling tolerance are classified
                as warning-level.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationCronReceiptReportDashboard
        data={data}
      />
    </section>
  );
}