import { CalendarCheck, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { LeaveRequestForm } from "@/features/leaves/components/leave-request-form";
import { LeaveTable } from "@/features/leaves/components/leave-table";
import {
  getLeavePageData,
  parseLeaveListSearchParams,
} from "@/features/leaves/server/leave-queries";

type LeavesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeavesPage({ searchParams }: LeavesPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseLeaveListSearchParams(resolvedSearchParams);
  const data = await getLeavePageData(filters);

  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          Leave Management
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Leaves
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          Submit leave requests, track request status, and allow authorized
          HR/Admin/Heads to approve or reject pending requests.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-5">
          <CalendarCheck className="h-6 w-6 text-[var(--starland-info)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.total}
          </p>
        </article>

        <article className="starland-card p-5">
          <Clock3 className="h-6 w-6 text-[var(--starland-warning)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Pending
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.pending}
          </p>
        </article>

        <article className="starland-card p-5">
          <CheckCircle2 className="h-6 w-6 text-[var(--starland-success)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Approved
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.approved}
          </p>
        </article>

        <article className="starland-card p-5">
          <XCircle className="h-6 w-6 text-[var(--starland-danger)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Rejected
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.rejected}
          </p>
        </article>
      </div>

      <LeaveRequestForm leaveTypes={data.leaveTypes} />

      <LeaveTable data={data} />
    </section>
  );
}