import Link from "next/link";
import {
  AppWindow,
  BellRing,
  Bot,
  Building2,
  Cable,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HardDriveUpload,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type {
  SettingsSection,
  SettingsSectionIcon,
  SettingsSectionStatus,
} from "../types/settings-types";

type SettingsSectionCardProps = {
  section: SettingsSection;
};

const SETTINGS_ICON_MAP: Record<
  SettingsSectionIcon,
  LucideIcon
> = {
  AppWindow,
  Building2,
  CalendarClock,
  Bot,
  ShieldCheck,
  BellRing,
  HardDriveUpload,
  Cable,
  Wrench,
};

function statusBadgeClass(
  status: SettingsSectionStatus,
): string {
  switch (status) {
    case "AVAILABLE":
      return "starland-badge-success";

    case "NEXT":
      return "starland-badge-info";

    case "PLANNED":
      return "bg-slate-100 text-slate-700";
  }
}

function StatusIcon({
  status,
}: {
  status: SettingsSectionStatus;
}) {
  switch (status) {
    case "AVAILABLE":
      return (
        <CheckCircle2
          className="h-4 w-4"
          aria-hidden="true"
        />
      );

    case "NEXT":
    case "PLANNED":
      return (
        <Clock3
          className="h-4 w-4"
          aria-hidden="true"
        />
      );
  }
}

function SettingsSectionCardContent({
  section,
}: SettingsSectionCardProps) {
  const Icon =
    SETTINGS_ICON_MAP[
      section.icon
    ];

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
          <Icon
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>

        <span
          className={[
            "starland-badge",
            statusBadgeClass(
              section.status,
            ),
          ].join(" ")}
        >
          <StatusIcon
            status={section.status}
          />

          {section.status}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--starland-muted-text)]">
          {section.stepLabel}
        </p>

        <h2 className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
          {section.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
          {section.description}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {section.features.map(
          (feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-[var(--starland-muted-text)]"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--starland-soft-green)]"
                aria-hidden="true"
              />

              <span>
                {feature}
              </span>
            </li>
          ),
        )}
      </ul>

      <div className="mt-auto pt-5">
        {section.href ? (
          <span className="starland-btn starland-btn-primary w-full justify-center">
            Open Settings
          </span>
        ) : section.status ===
          "NEXT" ? (
          <span className="starland-btn starland-btn-soft pointer-events-none w-full justify-center">
            Next Development Step
          </span>
        ) : (
          <span className="starland-btn starland-btn-soft pointer-events-none w-full justify-center opacity-60">
            Planned
          </span>
        )}
      </div>
    </>
  );
}

export function SettingsSectionCard({
  section,
}: SettingsSectionCardProps) {
  const className =
    "starland-card flex h-full flex-col p-5 transition-transform duration-200 hover:-translate-y-0.5";

  if (section.href) {
    return (
      <Link
        href={section.href}
        className={className}
      >
        <SettingsSectionCardContent
          section={section}
        />
      </Link>
    );
  }

  return (
    <article
      className={className}
      aria-disabled="true"
    >
      <SettingsSectionCardContent
        section={section}
      />
    </article>
  );
}