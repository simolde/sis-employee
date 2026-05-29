import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  MailOpen,
  UsersRound,
} from "lucide-react";
import { NoticeReadReportTable } from "@/features/notices/components/notice-read-report-table";
import { getNoticeReadReportData } from "@/features/notices/server/notice-read-report-queries";

type NoticeReadReportPageProps = {
  params: Promise<{
    noticeId: string;
  }>;
};

export default async function NoticeReadReportPage({
  params,
}: NoticeReadReportPageProps) {
  const { noticeId } = await params;
  const data = await getNoticeReadReportData(noticeId);

  if (!data) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Notice Report
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Notice Read Report
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review who has read this notice and who has not opened it yet.
          </p>
        </div>

        <Link
          href="/dashboard/notices"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Notices
        </Link>
      </div>

      <section className="starland-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="starland-badge starland-badge-info">
                Audience: {data.notice.audience.replaceAll("_", " ")}
              </span>
              <span className="starland-badge starland-badge-info">
                Branch: {data.notice.branchName}
              </span>
              <span className="starland-badge starland-badge-info">
                Department: {data.notice.departmentName}
              </span>
              <span className="starland-badge starland-badge-success">
                {data.notice.status}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-extrabold text-[var(--starland-dark-text)]">
              {data.notice.title}
            </h2>

            <p className="mt-2 text-sm text-[var(--starland-muted-text)]">
              Published: {data.notice.publishedAt} · Expires:{" "}
              {data.notice.expiresAt}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-5 py-4 text-center">
            <p className="text-sm font-bold text-[var(--starland-muted-text)]">
              Read Rate
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.readPercentage}%
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-5">
          <UsersRound className="h-6 w-6 text-[var(--starland-info)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Recipients
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalRecipients}
          </p>
        </article>

        <article className="starland-card p-5">
          <CheckCircle2 className="h-6 w-6 text-[var(--starland-success)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Read
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalRead}
          </p>
        </article>

        <article className="starland-card p-5">
          <Eye className="h-6 w-6 text-[var(--starland-warning)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Unread
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalUnread}
          </p>
        </article>

        <article className="starland-card p-5">
          <MailOpen className="h-6 w-6 text-[var(--starland-danger)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Read Rate
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.readPercentage}%
          </p>
        </article>
      </div>

      <NoticeReadReportTable data={data} />
    </section>
  );
}