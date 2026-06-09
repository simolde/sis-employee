import Link from "next/link";
import {
  ArrowLeft,
  DatabaseSearch,
  Network,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { OrganizationTableSchemaDashboard } from "@/features/settings/organization/schema/components/organization-table-schema-dashboard";
import { getOrganizationTableSchemaInspectionData } from "@/features/settings/organization/schema/server/organization-table-schema-queries";

export const dynamic =
  "force-dynamic";

export default async function DepartmentSettingsPage() {
  await requireCanManageEmployees();

  const data =
    await getOrganizationTableSchemaInspectionData(
      "departments",
    );

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Organization Master Data
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Department Management
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Inspect the exact department database
            structure before enabling creation,
            editing, status management, duplicate
            prevention, and dependency-aware
            deletion.
          </p>
        </div>

        <Link
          href="/dashboard/settings/organization"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Organization Structure
        </Link>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <Network
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Step 151C-1
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Exact Department Schema Discovery
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                The application reads the current
                MySQL metadata so the upcoming
                department CRUD matches your real
                database columns, constraints, and
                branch relationships.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-white/10 bg-[var(--starland-modern-bg)] p-4">
          <DatabaseSearch
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="text-sm font-semibold leading-6 text-[var(--starland-muted-text)]">
            This page is read-only. It does not
            insert, update, delete, migrate, or alter
            department records.
          </p>
        </div>
      </section>

      <OrganizationTableSchemaDashboard
        data={data}
      />
    </section>
  );
}