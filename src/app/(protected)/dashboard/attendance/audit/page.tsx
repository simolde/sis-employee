import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Edit3,
  History,
  Search,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAuditActions } from "@/features/attendance/audit/components/attendance-audit-actions";
import { AttendanceAuditTable } from "@/features/attendance/audit/components/attendance-audit-table";
import {
  getAttendanceAuditData,
  parseAttendanceAuditSearchParams,
} from "@/features/attendance/audit/server/attendance-audit-queries";
import {
  attendanceAuditActionOptions,
  type AttendanceAuditFilters,
} from "@/features/attendance/audit/types/attendance-audit-types";

type AttendanceAuditPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatActionLabel(action: string): string {
  if (action === "ALL") {
    return "All Actions";
  }

  if (action === "ATTENDANCE_STATUS_UPDATED") {
    return "Attendance Status Updated";
  }

  return action.replaceAll("_", " ");
}

function AttendanceAuditFiltersForm({
  filters,
}: {
  filters: AttendanceAuditFilters;
}) {
  return (
    <section className="starland-card p-5 print:hidden">
      <form className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_auto_auto] lg:items-end">
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
            placeholder="Action, attendance ID, entity"
            defaultValue={filters.q}
          />
        </div>

        <div>
          <label
            htmlFor="action"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Action
          </label>

          <select
            id="action"
            name="action"
            className="starland-input mt-2"
            defaultValue={filters.action}
          >
            {attendanceAuditActionOptions.map((action) => (
              <option key={action} value={action}>
                {formatActionLabel(action)}
              </option>
            ))}
          </select>
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

        <button type="submit" className="starland-btn starland-btn-primary">
          <Search className="h-4 w-4" aria-hidden="true" />
          Apply
        </button>

        <Link
          href="/dashboard/attendance/audit"
          className="starland-btn starland-btn-soft"
        >
          Reset
        </Link>
      </form>
    </section>
  );
}

export default async function AttendanceAuditPage({
  searchParams,
}: AttendanceAuditPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseAttendanceAuditSearchParams(resolvedSearchParams);
  const result = await getAttendanceAuditData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Audit Trail
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Audit Trail
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Track manual attendance changes, missing-timeout automation, review
            approvals, and attendance status updates.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <AttendanceAuditActions result={result} />

          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-primary"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Attendance Actions
          </Link>

          <Link
            href="/dashboard/attendance"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Attendance
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Attendance Security
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Audit Every Sensitive Attendance Change
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Manual input, corrections, approvals, and missing-timeout automation
            are logged here so HR/Admin can trace who changed what and when.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Current Action Filter
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {formatActionLabel(result.filters.action)}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardList className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Date Filter
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {result.filters.dateFrom || "All"} to{" "}
              {result.filters.dateTo || "All"}
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Search: {result.filters.q || "—"}
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 md:grid-cols-2 xl:grid-cols-6">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardCheck className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Manual Created
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.manualCreated}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Edit3 className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Manual Corrected
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.manualCorrected}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-6 w-6 text-[var(--starland-danger)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Missing Timeout
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.missingTimeout}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Verified
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.verified}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Approved
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.approved}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Status Updated
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.statusUpdated}
            </p>
          </article>
        </div>
      </section>

      <AttendanceAuditFiltersForm filters={result.filters} />

      <AttendanceAuditTable result={result} />
    </section>
  );
}