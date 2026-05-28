import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NoticeEditForm } from "@/features/notices/components/notice-edit-form";
import { getNoticeEditData } from "@/features/notices/server/notice-queries";

type NoticeEditPageProps = {
  params: Promise<{
    noticeId: string;
  }>;
};

export default async function NoticeEditPage({ params }: NoticeEditPageProps) {
  const { noticeId } = await params;
  const notice = await getNoticeEditData(noticeId);

  if (!notice) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Notice Editor
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Edit Notice
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Update this notice. Publishing, unpublishing, and archiving are
            handled from the notices list.
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

      <NoticeEditForm notice={notice} />
    </section>
  );
}