import {
  Map,
  Settings2,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { SettingsOverview } from "@/features/settings/components/settings-overview";
import {
  getSettingsOverviewSummary,
  SETTINGS_SECTIONS,
} from "@/features/settings/config/settings-sections";

export const dynamic =
  "force-dynamic";

export default async function SettingsPage() {
  await requireCanManageEmployees();

  const summary =
    getSettingsOverviewSummary();

  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-info">
          System Administration
        </span>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Settings
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          Configure the Starland Employee Attendance
          System, school organization, attendance
          policies, security controls, notifications,
          storage, integrations, and maintenance
          operations.
        </p>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <Settings2
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Central Configuration
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Starland System Settings
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Settings are organized by operational
                category. Each persistent change will
                eventually include validation,
                permission checks, and an immutable
                audit record.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-white/10 bg-[var(--starland-modern-bg)] p-4">
          <Map
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="text-sm font-semibold leading-6 text-[var(--starland-muted-text)]">
            Development is now moving through the
            settings categories before returning to
            employee accounts, RFID cards, and core
            attendance operations.
          </p>
        </div>
      </section>

      <SettingsOverview
        sections={SETTINGS_SECTIONS}
        summary={summary}
      />
    </section>
  );
}