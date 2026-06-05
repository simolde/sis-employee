import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type AttendanceActionCardTone =
  | "success"
  | "warning"
  | "info"
  | "danger";

type AttendanceActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  buttonLabel: string;
  statLabel: string;
  statValue: number;
  tone: AttendanceActionCardTone;
};

function iconToneClass(
  tone: AttendanceActionCardTone,
): string {
  switch (tone) {
    case "warning":
      return "text-[var(--starland-warning)]";

    case "info":
      return "text-[var(--starland-info)]";

    case "danger":
      return "text-[var(--starland-danger)]";

    default:
      return "text-[var(--starland-success)]";
  }
}

function badgeToneClass(
  tone: AttendanceActionCardTone,
): string {
  switch (tone) {
    case "warning":
      return "starland-badge-warning";

    case "info":
      return "starland-badge-info";

    case "danger":
      return "starland-badge-danger";

    default:
      return "starland-badge-success";
  }
}

export function AttendanceActionCard({
  title,
  description,
  href,
  icon: Icon,
  badge,
  buttonLabel,
  statLabel,
  statValue,
  tone,
}: AttendanceActionCardProps) {
  return (
    <article className="starland-card flex flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)]">
            <Icon
              className={[
                "h-6 w-6",
                iconToneClass(tone),
              ].join(" ")}
              aria-hidden="true"
            />
          </div>

          <span
            className={[
              "starland-badge",
              badgeToneClass(tone),
            ].join(" ")}
          >
            {badge}
          </span>
        </div>

        <h2 className="mt-5 text-lg font-extrabold text-[var(--starland-dark-text)]">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
          {description}
        </p>

        <div className="mt-4 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
            {statLabel}
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {statValue}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          href={href}
          className="starland-btn starland-btn-primary"
        >
          {buttonLabel}
        </Link>
      </div>
    </article>
  );
}