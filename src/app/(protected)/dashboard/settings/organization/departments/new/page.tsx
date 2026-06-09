import Link from "next/link";
import {
  ArrowLeft,
  Network,
  Plus,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { DepartmentForm } from "@/features/settings/organization/departments/components/department-form";
import { createDepartmentAction } from "@/features/settings/organization/departments/server/department-management-actions";

export const dynamic =
  "force-dynamic";

export default async function NewDepartmentPage() {
  await requireCanManageEmployees();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Organization Master Data
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Create Department
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Add a new department that can be assigned
            to employee profiles and targeted
            announcements.
          </p>
        </div>

        <Link
          href="/dashboard/settings/organization/departments"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Department Management
        </Link>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <Plus
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                New Organization Department
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Department Identity
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Use a short, stable department code
                and the complete department name.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-[var(--starland-modern-bg)] p-4">
          <Network
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="text-sm font-semibold leading-6 text-[var(--starland-muted-text)]">
            Active departments can be assigned to
            employees and selected as notice
            audiences.
          </p>
        </div>
      </section>

      <DepartmentForm
        mode="CREATE"
        action={createDepartmentAction}
      />
    </section>
  );
}