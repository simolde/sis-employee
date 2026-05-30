import Link from "next/link";
import { ArrowLeft, Network } from "lucide-react";
import { requireCanManageSettings } from "@/features/auth/server/permission-guards";
import { DepartmentManagement } from "@/features/settings/components/department-management";
import { getDepartmentPageData } from "@/features/settings/server/organization-queries";

export default async function DepartmentsSettingsPage() {
  await requireCanManageSettings();

  const data = await getDepartmentPageData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Organization Setup
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Departments
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Manage departments used by employees, notices, attendance, and
            reports.
          </p>
        </div>

        <Link href="/dashboard/settings" className="starland-btn starland-btn-soft">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-5">
          <Network className="h-6 w-6 text-[var(--starland-info)]" />
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
      </div>

      <DepartmentManagement departments={data.departments} />
    </section>
  );
}