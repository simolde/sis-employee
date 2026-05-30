import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { requireCanManageSettings } from "@/features/auth/server/permission-guards";
import { ShiftManagement } from "@/features/settings/schedule-setup/components/shift-management";
import { getShiftPageData } from "@/features/settings/schedule-setup/server/schedule-setup-queries";

export default async function ShiftsSettingsPage() {
  await requireCanManageSettings();

  const data = await getShiftPageData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Schedule Setup
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Shifts
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Manage shift start and end times used for attendance calculations.
          </p>
        </div>

        <Link
          href="/dashboard/settings"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="starland-card p-5">
          <Clock3 className="h-6 w-6 text-[var(--starland-info)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.total}
          </p>
        </article>

        <article className="starland-card p-5">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Active
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-success)]">
            {data.summary.active}
          </p>
        </article>

        <article className="starland-card p-5">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Inactive
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-warning)]">
            {data.summary.inactive}
          </p>
        </article>

        <article className="starland-card p-5">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Archived
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-danger)]">
            {data.summary.archived}
          </p>
        </article>

        <article className="starland-card p-5">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Overnight
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.overnight}
          </p>
        </article>
      </div>

      <ShiftManagement shifts={data.shifts} />
    </section>
  );
}