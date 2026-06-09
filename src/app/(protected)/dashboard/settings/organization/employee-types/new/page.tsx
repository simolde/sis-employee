import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  UsersRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { EmployeeTypeForm } from "@/features/settings/organization/employee-types/components/employee-type-form";
import { createEmployeeTypeAction } from "@/features/settings/organization/employee-types/server/employee-type-management-actions";

export const dynamic = "force-dynamic";

export default async function NewEmployeeTypePage() {
  await requireCanManageEmployees();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Organization Master Data
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Create Employee Type
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Add a new employment classification that
            can be assigned to employee profiles.
          </p>
        </div>

        <Link
          href="/dashboard/settings/organization/employee-types"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Employee Type Management
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
                New Employment Classification
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Employee Type Identity
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Use a short, stable employee type
                code and the complete employment
                classification name.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-[var(--starland-modern-bg)] p-4">
          <UsersRound
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="text-sm font-semibold leading-6 text-[var(--starland-muted-text)]">
            Active employee types can be selected
            when creating or updating employee
            profiles.
          </p>
        </div>
      </section>

      <EmployeeTypeForm
        mode="CREATE"
        action={createEmployeeTypeAction}
      />
    </section>
  );
}