import { Archive, FileText, Megaphone, Send } from "lucide-react";
import { NoticeFilters } from "@/features/notices/components/notice-filters";
import { NoticeForm } from "@/features/notices/components/notice-form";
import { NoticeList } from "@/features/notices/components/notice-list";
import {
  getNoticePageData,
  parseNoticeListSearchParams,
} from "@/features/notices/server/notice-queries";

type NoticesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseNoticeListSearchParams(resolvedSearchParams);
  const data = await getNoticePageData(filters);

  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          Announcements
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Notices
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          View school announcements and manage notices by role audience, branch,
          and department when authorized.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-5">
          <FileText className="h-6 w-6 text-[var(--starland-info)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.total}
          </p>
        </article>

        <article className="starland-card p-5">
          <Megaphone className="h-6 w-6 text-[var(--starland-warning)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Draft
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.draft}
          </p>
        </article>

        <article className="starland-card p-5">
          <Send className="h-6 w-6 text-[var(--starland-success)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Published
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.published}
          </p>
        </article>

        <article className="starland-card p-5">
          <Archive className="h-6 w-6 text-[var(--starland-danger)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Archived
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.archived}
          </p>
        </article>
      </div>

      <NoticeFilters filters={data.filters} canManage={data.canManage} />

      {data.canManage ? (
        <NoticeForm
          branchOptions={data.branchOptions}
          departmentOptions={data.departmentOptions}
        />
      ) : null}

      <NoticeList data={data} />
    </section>
  );
}