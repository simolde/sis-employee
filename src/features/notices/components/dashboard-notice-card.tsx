import type { DashboardNoticeItem } from "../server/dashboard-notice-queries";

type DashboardNoticeCardProps = {
  notice: DashboardNoticeItem;
};

function previewText(value: string): string {
  if (value.length <= 180) {
    return value;
  }

  return `${value.slice(0, 180).trim()}...`;
}

export function DashboardNoticeCard({ notice }: DashboardNoticeCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--starland-border)] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="starland-badge starland-badge-success">Published</span>
        <span className="starland-badge starland-badge-info">
          {notice.audience.replaceAll("_", " ")}
        </span>
      </div>

      <h3 className="mt-3 text-base font-extrabold text-[var(--starland-dark-text)]">
        {notice.title}
      </h3>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--starland-muted-text)]">
        {previewText(notice.body)}
      </p>

      <div className="mt-4 grid gap-2 text-xs font-semibold text-[var(--starland-muted-text)] sm:grid-cols-2">
        <p>Branch: {notice.branchName}</p>
        <p>Department: {notice.departmentName}</p>
        <p>Published: {notice.publishedAt}</p>
        <p>Expires: {notice.expiresAt}</p>
      </div>
    </article>
  );
}