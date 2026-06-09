import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Database,
  Network,
} from "lucide-react";
import type { OrganizationSettingsOverviewData } from "../types/organization-settings-types";
import { OrganizationSettingsSectionCard } from "./organization-settings-section-card";

type OrganizationSettingsOverviewProps = {
  data:
    OrganizationSettingsOverviewData;
};

export function OrganizationSettingsOverview({
  data,
}: OrganizationSettingsOverviewProps) {
  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-4",
          data.databaseReachable
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          {data.databaseReachable ? (
            <CheckCircle2
              className="mt-0.5 h-6 w-6 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <CircleAlert
              className="mt-0.5 h-6 w-6 shrink-0"
              aria-hidden="true"
            />
          )}

          <div>
            <h2 className="font-extrabold">
              {data.databaseReachable
                ? "Organization Database Connected"
                : "Organization Database Unavailable"}
            </h2>

            <p className="mt-1 text-sm font-semibold leading-6">
              {data.databaseReachable
                ? "The organization structure tables were checked successfully."
                : "The application could not inspect the organization structure tables."}
            </p>

            <p className="mt-2 text-xs font-bold">
              Checked: {data.generatedAt}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Network
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Organization Modules
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalSections}
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Ready Tables
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.readySections}
          </p>
        </article>

        <article className="starland-card p-4">
          <Database
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Records
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalRecords}
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Needs Review
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.missingSections +
              data.summary.errorSections}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Building2
            className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
            aria-hidden="true"
          />

          <div>
            <h2 className="font-extrabold text-blue-900">
              Next: Branch Management
            </h2>

            <p className="mt-1 text-sm font-semibold leading-6 text-blue-800">
              The next step will inspect the actual
              Prisma Branch model and add validated,
              paginated branch management without
              changing or duplicating your existing
              database structure.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-[var(--starland-dark-text)]">
            Organization Modules
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            These master records will be used by
            employee profiles, attendance branches,
            schedules, reports, permissions, and
            filtering.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.sections.map(
            (section) => (
              <OrganizationSettingsSectionCard
                key={section.id}
                section={section}
              />
            ),
          )}
        </div>
      </section>
    </div>
  );
}