import {
  CheckCircle2,
  Clock3,
  Layers3,
  Settings2,
} from "lucide-react";
import type {
  SettingsOverviewSummary,
  SettingsSection,
} from "../types/settings-types";
import { SettingsSectionCard } from "./settings-section-card";

type SettingsOverviewProps = {
  sections:
    readonly SettingsSection[];

  summary:
    SettingsOverviewSummary;
};

export function SettingsOverview({
  sections,
  summary,
}: SettingsOverviewProps) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Settings2
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Settings Categories
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {summary.totalSections}
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Available
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              summary.availableSections
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Next Category
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {summary.nextSections}
          </p>
        </article>

        <article className="starland-card p-4">
          <Layers3
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Planned
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              summary.plannedSections
            }
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Clock3
            className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
            aria-hidden="true"
          />

          <div>
            <h2 className="font-extrabold text-blue-900">
              Next: Department Management
            </h2>

            <p className="mt-1 text-sm font-semibold leading-6 text-blue-800">
              Branch Management now has complete
              CRUD and geofence controls. The next
              organization implementation will use
              the confirmed departments schema to
              build exact department management.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-[var(--starland-dark-text)]">
            Settings Categories
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Categories are activated in sequence so
            organization, attendance, security, and
            integration settings share consistent
            validation and auditing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map(
            (section) => (
              <SettingsSectionCard
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