import Link from "next/link";
import { ArrowLeft, FileCheck2, Paperclip, ShieldCheck } from "lucide-react";
import { requireCanManageLeaves } from "@/features/auth/server/permission-guards";
import { LeaveTypeForm } from "@/features/leaves/components/leave-type-form";
import { LeaveTypeTable } from "@/features/leaves/components/leave-type-table";
import { getLeaveTypePageData } from "@/features/leaves/server/leave-type-queries";

export default async function LeaveTypesPage() {
  await requireCanManageLeaves();

  const data = await getLeaveTypePageData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Leave Setup
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Leave Types
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Maintain leave type rules, including paid/unpaid status and whether
            supporting attachment is required.
          </p>
        </div>

        <Link href="/dashboard/leaves" className="starland-btn starland-btn-soft">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Leaves
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-5">
          <ShieldCheck className="h-6 w-6 text-[var(--starland-info)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Types
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.total}
          </p>
        </article>

        <article className="starland-card p-5">
          <FileCheck2 className="h-6 w-6 text-[var(--starland-success)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Active
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.active}
          </p>
        </article>

        <article className="starland-card p-5">
          <ShieldCheck className="h-6 w-6 text-[var(--starland-warning)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Paid Types
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.paid}
          </p>
        </article>

        <article className="starland-card p-5">
          <Paperclip className="h-6 w-6 text-[var(--starland-danger)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Requires Attachment
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.requiresAttachment}
          </p>
        </article>
      </div>

      <LeaveTypeForm />

      <LeaveTypeTable leaveTypes={data.leaveTypes} />
    </section>
  );
}