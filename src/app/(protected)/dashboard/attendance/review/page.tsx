import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Hourglass,
  Search,
  ShieldCheck,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceReviewQueueActions } from "@/features/attendance/review/components/attendance-review-queue-actions";
import { AttendanceReviewQueueTable } from "@/features/attendance/review/components/attendance-review-queue-table";
import {
  getAttendanceReviewQueueData,
  parseAttendanceReviewQueueSearchParams,
} from "@/features/attendance/review/server/attendance-review-queue-queries";
import {
  attendanceReviewQueueStatusValues,
  type AttendanceReviewQueueFilters,
} from "@/features/attendance/review/types/attendance-review-queue-types";

type AttendanceReviewQueuePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatReviewStatusLabel(status: string): string {
  if (status === "OPEN") {
    return "Open Review";
  }

  if (status === "VERIFIED") {
    return "Verified, Not Approved";
  }

  if (status === "APPROVED") {
    return "Approved";
  }

  return "All Review Records";
}

function AttendanceReviewQueueFiltersForm({
  filters,
}: {
  filters: AttendanceReviewQueueFilters;
}) {
  return (
    <section className="starland-card p-5 print:hidden">
      <form className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr_auto_auto] lg:items-end">
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
            htmlFor="reviewStatus"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Review Status
          </label>

          <select
            id="reviewStatus"
            name="reviewStatus"
            className="starland-input mt-2"
            defaultValue={filters.reviewStatus}
          >
            {attendanceReviewQueueStatusValues.map((status) => (
              <option key={status} value={status}>
                {formatReviewStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="starland-btn starland-btn-primary">
          <Search className="h-4 w-4" aria-hidden="true" />
          Apply
        </button>

        <Link
          href="/dashboard/attendance/review"
          className="starland-btn starland-btn-soft"
        >
          Reset
        </Link>
      </form>
    </section>
  );
}

export default async function AttendanceReviewQueuePage({
  searchParams,
}: AttendanceReviewQueuePageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseAttendanceReviewQueueSearchParams(resolvedSearchParams);
  const result = await getAttendanceReviewQueueData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-warning">
            HR Review
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Review Queue
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review only manual attendance, manual edits, and corrections. Normal
            RFID, biometric/kiosk, and ODL punches are excluded by policy.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <AttendanceReviewQueueActions result={result} />

          <Link
            href="/dashboard/attendance/manual"
            className="starland-btn starland-btn-primary"
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            Manual Input
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
            Review Policy
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Manual Changes Require Review
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Records appear here only when they were created manually, corrected
            manually, or have manual edit/correction logs. Normal attendance
            punches do not need HR review.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardCheck className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Review Required
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalReviewRequired}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Hourglass className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Open Review
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.openReview}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Verified Not Approved
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.verifiedNotApproved}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Approved
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.approved}
            </p>
          </article>
        </div>
      </section>

      <AttendanceReviewQueueFiltersForm filters={result.filters} />

      <AttendanceReviewQueueTable result={result} />
    </section>
  );
}