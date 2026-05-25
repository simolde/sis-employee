import type { ReactNode } from "react";

type PagePlaceholderProps = {
  title: string;
  description: string;
  badge?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export function PagePlaceholder({
  title,
  description,
  badge = "Coming Soon",
  children,
  actions,
}: PagePlaceholderProps) {
  return (
    <section className="starland-page">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info mb-3">
            {badge}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            {description}
          </p>
        </div>

        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>

      <div className="starland-card p-5 sm:p-6">
        {children ?? (
          <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-sm text-[var(--starland-muted-text)]">
            This module page is ready. The database-backed feature components
            will be added step by step.
          </div>
        )}
      </div>
    </section>
  );
}