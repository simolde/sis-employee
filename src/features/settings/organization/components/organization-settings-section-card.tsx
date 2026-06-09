import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  CircleAlert,
  Database,
  Network,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type {
  OrganizationSettingsReadinessStatus,
  OrganizationSettingsSection,
  OrganizationSettingsSectionIcon,
} from "../types/organization-settings-types";

type OrganizationSettingsSectionCardProps = {
  section:
    OrganizationSettingsSection;
};

const ICON_MAP: Record<
  OrganizationSettingsSectionIcon,
  LucideIcon
> = {
  Building2,
  Network,
  BadgeCheck,
  UsersRound,
};

function statusBadgeClass(
  status:
    OrganizationSettingsReadinessStatus,
): string {
  switch (status) {
    case "READY":
      return "starland-badge-success";

    case "MISSING":
      return "starland-badge-warning";

    case "ERROR":
      return "starland-badge-danger";
  }
}

function StatusIcon({
  status,
}: {
  status:
    OrganizationSettingsReadinessStatus;
}) {
  switch (status) {
    case "READY":
      return (
        <CheckCircle2
          className="h-4 w-4"
          aria-hidden="true"
        />
      );

    case "MISSING":
    case "ERROR":
      return (
        <CircleAlert
          className="h-4 w-4"
          aria-hidden="true"
        />
      );
  }
}

function OrganizationSettingsSectionCardContent({
  section,
}: OrganizationSettingsSectionCardProps) {
  const Icon =
    ICON_MAP[
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
          {section.developmentStep}
        </p>

        <h2 className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
          {section.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
          {section.description}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
        <div className="flex items-center gap-2">
          <Database
            className="h-4 w-4 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <span className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
            {section.tableName}
          </span>
        </div>

        <p className="mt-2 text-2xl font-extrabold text-[var(--starland-dark-text)]">
          {section.recordCount ??
            "—"}
        </p>

        <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
          {section.recordCount ===
          1
            ? "database record"
            : "database records"}
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

      {section.errorMessage ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="break-words text-xs font-semibold leading-5 text-amber-800">
            {section.errorMessage}
          </p>
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        {section.href ? (
          <span className="starland-btn starland-btn-primary w-full justify-center">
            Manage {section.title}
          </span>
        ) : section.status ===
          "READY" ? (
          <span className="starland-btn starland-btn-soft pointer-events-none w-full justify-center">
            Ready for {section.developmentStep}
          </span>
        ) : (
          <span className="starland-btn starland-btn-soft pointer-events-none w-full justify-center opacity-60">
            Database Review Required
          </span>
        )}
      </div>
    </>
  );
}

export function OrganizationSettingsSectionCard({
  section,
}: OrganizationSettingsSectionCardProps) {
  const className =
    "starland-card flex h-full flex-col p-5 transition-transform duration-200 hover:-translate-y-0.5";

  if (section.href) {
    return (
      <Link
        href={section.href}
        className={className}
      >
        <OrganizationSettingsSectionCardContent
          section={section}
        />
      </Link>
    );
  }

  return (
    <article className={className}>
      <OrganizationSettingsSectionCardContent
        section={section}
      />
    </article>
  );
}