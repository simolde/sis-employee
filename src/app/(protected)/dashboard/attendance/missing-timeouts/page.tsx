import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardCheck,
  ClockAlert,
  Hourglass,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { MissingTimeoutTable } from "@/features/attendance/missing-timeouts/components/missing-timeout-table";
import { getMissingTimeoutPageData } from "@/features/attendance/missing-timeouts/server/missing-timeout-queries";

export default async function MissingTimeoutPage() {
  await requireCanManageEmployees();

  const data = await getMissingTimeoutPageData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-warning">
            Missing Timeout
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Missing Timeout Management
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Mark old attendance records with time-in but no time-out as missing
            timeout. This does not make the record manual and does not require
            HR review unless the record was manually edited.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/review"
            className="starland-btn starland-btn-primary"
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            Review Queue
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

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Timeout Policy
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Time-In Without Time-Out
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Records from previous days or records older than 18 hours with no
            time-out can be marked as MISSING TIMEOUT. Normal records remain
            normal punches. Manual corrections still go to the review queue.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <AlertTriangle className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Eligible Missing Timeouts
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.eligibleMissingTimeouts}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Already Missing Timeout
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.alreadyMarkedMissingTimeouts}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 sm:col-span-2 xl:col-span-1">
            <Hourglass className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual Pending Review
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.manualPendingReview}
            </p>
          </article>
        </div>
      </section>

      <MissingTimeoutTable data={data} />
    </section>
  );
}