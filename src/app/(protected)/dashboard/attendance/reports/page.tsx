import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ClockAlert,
  FileSpreadsheet,
  Hourglass,
  Timer,
} from "lucide-react";
import { AttendanceReportClient } from "@/features/attendance/reports/attendance-report-client";
import {
  getAttendanceReportData,
  parseAttendanceReportSearchParams,
} from "@/features/attendance/reports/attendance-report-queries";
import {
  attendanceReportSourceValues,
  attendanceReportStatusValues,
  type AttendanceReportFilters,
} from "@/features/attendance/reports/attendance-report-types";

type AttendanceReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatStatusLabel(status: string): string {
  if (status === "ALL") {
    return "All Statuses";
  }

  return status.replaceAll("_", " ");
}

function formatSourceLabel(source: string): string {
  if (source === "ALL") {
    return "All Sources";
  }

  return source;
}

function AttendanceReportFiltersForm({
  filters,
}: {
  filters: AttendanceReportFilters;
}) {
  return (
    <section className="starland-card p-5 print:hidden">
      <form className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_0.9fr_auto_auto] lg:items-end">
        <div>
          <label
            htmlFor="q"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Search
          </label>

          <input
            id="q"
            name="q"
            className="starland-input mt-2"
            placeholder="Employee, branch, department, schedule"
            defaultValue={filters.q}
          />
        </div>

        <div>
          <label
            htmlFor="dateFrom"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Date From
          </label>

          <input
            id="dateFrom"
            name="dateFrom"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateFrom}
          />
        </div>

        <div>
          <label
            htmlFor="dateTo"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Date To
          </label>

          <input
            id="dateTo"
            name="dateTo"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateTo}
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Status
          </label>

          <select
            id="status"
            name="status"
            className="starland-input mt-2"
            defaultValue={filters.status}
          >
            {attendanceReportStatusValues.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="source"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Source
          </label>

          <select
            id="source"
            name="source"
            className="starland-input mt-2"
            defaultValue={filters.source}
          >
            {attendanceReportSourceValues.map((source) => (
              <option key={source} value={source}>
                {formatSourceLabel(source)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="starland-btn starland-btn-primary">
          Apply
        </button>

        <Link
          href="/dashboard/attendance/reports"
          className="starland-btn starland-btn-soft"
        >
          Reset
        </Link>
      </form>
    </section>
  );
}

export default async function AttendanceReportsPage({
  searchParams,
}: AttendanceReportsPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseAttendanceReportSearchParams(resolvedSearchParams);
  const data = await getAttendanceReportData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Attendance Reports
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Reports
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Generate printable and exportable attendance reports by date,
            status, source, employee, department, branch, and schedule.
          </p>
        </div>

        <Link href="/dashboard/attendance" className="starland-btn starland-btn-soft">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Attendance
        </Link>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {data.filters.dateFrom} to {data.filters.dateTo}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {formatStatusLabel(data.filters.status)}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {formatSourceLabel(data.filters.source)}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Starland Attendance Report
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/70">
            Search: {data.filters.q || "—"}
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <FileSpreadsheet className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Records
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.totalRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              On Time
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.onTime}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Late
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.late}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Timer className="h-6 w-6 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Hours
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.totalHours}
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <BarChart3 className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Half Day
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.halfDay}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Hourglass className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Pending Review
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.pendingReview}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert className="h-6 w-6 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Missing Timeout
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.missingTimeout}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <BarChart3 className="h-6 w-6 text-[var(--starland-muted-text)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Absent / Excused
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.absent} / {data.summary.excused}
            </p>
          </article>
        </div>
      </section>

      <AttendanceReportFiltersForm filters={data.filters} />

      <AttendanceReportClient data={data} />
    </section>
  );
}