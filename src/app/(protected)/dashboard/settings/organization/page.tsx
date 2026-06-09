import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Network,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { OrganizationSettingsOverview } from "@/features/settings/organization/components/organization-settings-overview";
import { getOrganizationSettingsOverviewData } from "@/features/settings/organization/server/organization-settings-queries";

export const dynamic =
  "force-dynamic";

export default async function OrganizationSettingsPage() {
  await requireCanManageEmployees();

  const data =
    await getOrganizationSettingsOverviewData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            School Organization
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Organization Structure
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review and manage the branches,
            departments, designations, and employee
            types used throughout the Starland
            Employee Attendance System.
          </p>
        </div>

        <Link
          href="/dashboard/settings"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Settings Overview
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
                Organization Master Data
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                School Structure and Employment Classification
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Organization records connect employee
                profiles to branches, departments,
                job titles, employment types,
                attendance policies, schedules, and
                reports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-white/10 bg-[var(--starland-modern-bg)] p-4">
          <Building2
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="text-sm font-semibold leading-6 text-[var(--starland-muted-text)]">
            This readiness screen checks your
            existing tables first. CRUD pages will
            use the actual Prisma model fields instead
            of creating conflicting organization
            structures.
          </p>
        </div>
      </section>

      <OrganizationSettingsOverview
        data={data}
      />
    </section>
  );
}