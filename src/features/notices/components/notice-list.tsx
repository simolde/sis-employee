import Link from "next/link";
import { BarChart3, Eye, Pencil } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import {
  archiveNoticeAction,
  publishNoticeAction,
  unpublishNoticeAction,
} from "../server/notice-actions";
import type { NoticeListItem, NoticePageData } from "../types/notice-types";
import { NoticeStatusBadge } from "./notice-status-badge";

type NoticeListProps = {
  data: NoticePageData;
};

function createPageHref(data: NoticePageData, page: number): string {
  const params = new URLSearchParams();

  if (data.filters.q) {
    params.set("q", data.filters.q);
  }

  if (data.filters.status !== "ANY") {
    params.set("status", data.filters.status);
  }

  if (data.filters.audience !== "ANY") {
    params.set("audience", data.filters.audience);
  }

  params.set("page", String(page));
  params.set("pageSize", String(data.filters.pageSize));

  return `/dashboard/notices?${params.toString()}`;
}

function NoticeActions({ notice }: { notice: NoticeListItem }) {
  const publishAction = publishNoticeAction.bind(null, String(notice.noticeId));
  const unpublishAction = unpublishNoticeAction.bind(
    null,
    String(notice.noticeId),
  );
  const archiveAction = archiveNoticeAction.bind(null, String(notice.noticeId));

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/dashboard/notices/${notice.noticeId}`}
        className="starland-btn starland-btn-soft starland-btn-sm"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        View
      </Link>

      <Link
        href={`/dashboard/notices/${notice.noticeId}/reads`}
        className="starland-btn starland-btn-soft starland-btn-sm"
      >
        <BarChart3 className="h-4 w-4" aria-hidden="true" />
        Reads
      </Link>

      <Link
        href={`/dashboard/notices/${notice.noticeId}/edit`}
        className="starland-btn starland-btn-secondary starland-btn-sm"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Edit
      </Link>

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

function EmployeeViewAction({ notice }: { notice: NoticeListItem }) {
  return (
    <Link
      href={`/dashboard/notices/${notice.noticeId}`}
      className="starland-btn starland-btn-primary starland-btn-sm"
    >
      <Eye className="h-4 w-4" aria-hidden="true" />
      View Full Notice
    </Link>
  );
}

export  function NoticeList({ data }: NoticeListProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          {data.canManage ? "All Notices" : "Published Notices"}
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          {data.canManage
            ? "Manage draft, published, and archived announcements."
            : "Announcements visible to your role, branch, and department will appear here."}
        </p>
      </div>

      <div className="divide-y divide-[var(--starland-border)]">
        {data.notices.length > 0 ? (
          data.notices.map((notice) => (
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

                  <Link
                    href={`/dashboard/notices/${notice.noticeId}`}
                    className="mt-3 block text-xl font-extrabold text-[var(--starland-dark-text)] hover:text-[var(--starland-main-green)] hover:underline"
                  >
                    {notice.title}
                  </Link>

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

                <div>
                  {data.canManage ? (
                    <NoticeActions notice={notice} />
                  ) : (
                    <EmployeeViewAction notice={notice} />
                  )}
                </div>
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
                Try changing your filters or create a new notice.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--starland-border)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--starland-muted-text)]">
            Page{" "}
            <span className="font-bold text-[var(--starland-dark-text)]">
              {data.pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[var(--starland-dark-text)]">
              {data.pagination.totalPages}
            </span>{" "}
            · {data.pagination.totalItems} result
            {data.pagination.totalItems === 1 ? "" : "s"}
          </p>

          <div className="flex gap-2">
            {data.pagination.hasPreviousPage ? (
              <Link
                href={createPageHref(data, data.pagination.page - 1)}
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Previous
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Previous
              </span>
            )}

            {data.pagination.hasNextPage ? (
              <Link
                href={createPageHref(data, data.pagination.page + 1)}
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Next
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Next
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}