import Link from "next/link";
import {
  ArrowLeft,
  DatabaseSearch,
  UsersRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { OrganizationTableSchemaDashboard } from "@/features/settings/organization/schema/components/organization-table-schema-dashboard";
import { getOrganizationTableSchemaInspectionData } from "@/features/settings/organization/schema/server/organization-table-schema-queries";

export const dynamic = "force-dynamic";

export default async function EmployeeTypeSchemaPage() {
  await requireCanManageEmployees();

  const data =
    await getOrganizationTableSchemaInspectionData(
      "emp_types",
    );

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Database Inspection
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Employee Type Schema Inspector
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review the exact MySQL employee-type
            columns, indexes, relationships, and
            sample records.
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
            <DatabaseSearch
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Read-Only Database Metadata
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Exact Employee Type Database Contract
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                This inspector does not insert,
                update, delete, migrate, or alter
                employee-type records.
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
            The confirmed schema is now used by the
            Employee Type Management CRUD pages.
          </p>
        </div>
      </section>

      <OrganizationTableSchemaDashboard
        data={data}
      />
    </section>
  );
}