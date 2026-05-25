import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone?: "success" | "warning" | "danger" | "info";
};

const toneClasses: Record<NonNullable<DashboardCardProps["tone"]>, string> = {
  success: "bg-green-50 text-[var(--starland-success)]",
  warning: "bg-amber-50 text-[var(--starland-warning)]",
  danger: "bg-red-50 text-[var(--starland-danger)]",
  info: "bg-sky-50 text-[var(--starland-info)]",
};

export function DashboardCard({
  title,
  value,
  helper,
  icon,
  tone = "info",
}: DashboardCardProps) {
  return (
    <article className="starland-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            {title}
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            {value}
          </p>
          <p className="mt-2 text-xs font-medium text-[var(--starland-muted-text)]">
            {helper}
          </p>
        </div>

        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            toneClasses[tone],
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}