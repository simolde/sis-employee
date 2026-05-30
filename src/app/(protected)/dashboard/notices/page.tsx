import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NoticeDetailCard } from "@/features/notices/components/notice-detail-card";
import { getNoticeDetailData } from "@/features/notices/server/notice-detail-queries";

type NoticeDetailPageProps = {
  params: Promise<{
    noticeId: string;
  }>;
};

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  const { noticeId } = await params;
  const notice = await getNoticeDetailData(noticeId);

  if (!notice) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Announcement
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Notice Details
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            View the full school announcement.
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

      <NoticeDetailCard notice={notice} />
    </section>
  );
}