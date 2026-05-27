import { CalendarDays, Clock3, ShieldCheck } from "lucide-react";
import type { LeaveBalanceSummary } from "../types/leave-types";

type LeaveBalanceCardProps = {
  balance: LeaveBalanceSummary | null;
};

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  if (!balance) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="starland-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--starland-muted-text)]">
              Available Leave
            </p>
            <p className="mt-3 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {balance.availableLeave}
            </p>
            <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
              Current remaining leave balance.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[var(--starland-success)]">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </article>

      <article className="starland-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--starland-muted-text)]">
              Pending Days
            </p>
            <p className="mt-3 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {balance.pendingDays}
            </p>
            <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
              Submitted leave days awaiting review.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[var(--starland-warning)]">
            <Clock3 className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </article>

      <article className="starland-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--starland-muted-text)]">
              Approved This Year
            </p>
            <p className="mt-3 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {balance.approvedDaysThisYear}
            </p>
            <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
              Total approved leave days for the current year.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[var(--starland-info)]">
            <CalendarDays className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </article>
    </section>
  );
}