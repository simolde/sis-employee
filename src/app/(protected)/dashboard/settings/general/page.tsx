import Link from "next/link";
import {
  ArrowLeft,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { GeneralSettingsForm } from "@/features/settings/general/components/general-settings-form";
import { getGeneralApplicationSettingsData } from "@/features/settings/general/server/general-settings-queries";

export const dynamic =
  "force-dynamic";

export default async function GeneralSettingsPage() {
  await requireCanManageEmployees();

  const data =
    await getGeneralApplicationSettingsData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            General Configuration
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            General Application Settings
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Configure the application identity,
            school identity, timezone, locale,
            display formats, and common system
            defaults.
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
            <Settings2
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Persistent General Settings
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Application and Regional Defaults
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Saved changes are stored as immutable
                settings snapshots. The latest valid
                snapshot becomes the active general
                configuration.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-white/10 bg-[var(--starland-modern-bg)] p-4">
          <SlidersHorizontal
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="text-sm font-semibold leading-6 text-[var(--starland-muted-text)]">
            These values will later be consumed by
            attendance tables, reports, employee
            pages, notifications, and date utilities.
          </p>
        </div>
      </section>

      <GeneralSettingsForm
        data={data}
      />
    </section>
  );
}