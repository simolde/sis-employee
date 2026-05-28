import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import {
  archiveNoticeAction,
  publishNoticeAction,
  unpublishNoticeAction,
} from "../server/notice-actions";
import type { NoticeListItem } from "../types/notice-types";
import { NoticeStatusBadge } from "./notice-status-badge";

type NoticeListProps = {
  notices: NoticeListItem[];
  canManage: boolean;
};

function NoticeActions({ notice }: { notice: NoticeListItem }) {
  const publishAction = publishNoticeAction.bind(null, String(notice.noticeId));
  const unpublishAction = unpublishNoticeAction.bind(
    null,
    String(notice.noticeId),
  );
  const archiveAction = archiveNoticeAction.bind(null, String(notice.noticeId));

  return (
    <div className="flex flex-wrap gap-2">
      {notice.status !== "PUBLISHED" && notice.status !== "ARCHIVED" ? (
        <form action={publishAction}>
          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Publish this notice?"
            className="starland-btn starland-btn-primary starland-btn-sm"
          >
            Publish
          </ConfirmSubmitButton>
        </form>
      ) : null}

      {notice.status === "PUBLISHED" ? (
        <form action={unpublishAction}>
          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Unpublish this notice and move it back to draft?"
            className="starland-btn starland-btn-secondary starland-btn-sm"
          >
            Unpublish
          </ConfirmSubmitButton>
        </form>
      ) : null}

      {notice.status !== "ARCHIVED" ? (
        <form action={archiveAction}>
          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Archive this notice?"
            className="starland-btn starland-btn-danger starland-btn-sm"
          >
            Archive
          </ConfirmSubmitButton>
        </form>
      ) : null}
    </div>
  );
}

export function NoticeList({ notices, canManage }: NoticeListProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          {canManage ? "All Notices" : "Published Notices"}
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          {canManage
            ? "Manage draft, published, and archived announcements."
            : "Announcements visible to your role, branch, and department will appear here."}
        </p>
      </div>

      <div className="divide-y divide-[var(--starland-border)]">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <article key={notice.noticeId} className="p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <NoticeStatusBadge status={notice.status} />
                    <span className="starland-badge starland-badge-info">
                      Audience: {notice.audience.replaceAll("_", " ")}
                    </span>
                    <span className="starland-badge starland-badge-info">
                      Branch: {notice.branchName}
                    </span>
                    <span className="starland-badge starland-badge-info">
                      Department: {notice.departmentName}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-extrabold text-[var(--starland-dark-text)]">
                    {notice.title}
                  </h3>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--starland-muted-text)]">
                    {notice.body}
                  </p>

                  <div className="mt-4 grid gap-2 text-xs font-semibold text-[var(--starland-muted-text)] sm:grid-cols-2 xl:grid-cols-5">
                    <p>Published: {notice.publishedAt}</p>
                    <p>Expires: {notice.expiresAt}</p>
                    <p>Created by: {notice.createdBy}</p>
                    <p>Updated by: {notice.updatedBy}</p>
                    <p>Updated: {notice.updatedAt}</p>
                  </div>
                </div>

                {canManage ? <NoticeActions notice={notice} /> : null}
              </div>
            </article>
          ))
        ) : (
          <div className="p-5">
            <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
              <p className="font-bold text-[var(--starland-dark-text)]">
                No notices found
              </p>
              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Notices and announcements will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}