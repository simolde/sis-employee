import Link from "next/link";
import { BarChart3, Pencil } from "lucide-react";
import type { NoticeDetailData } from "../types/notice-types";
import { NoticeStatusBadge } from "./notice-status-badge";

type NoticeDetailCardProps = {
  notice: NoticeDetailData;
};

export function NoticeDetailCard({ notice }: NoticeDetailCardProps) {
  return (
    <article className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <NoticeStatusBadge status={notice.status} />
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Audience: {notice.audience.replaceAll("_", " ")}
          </span>
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Branch: {notice.branchName}
          </span>
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Department: {notice.departmentName}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {notice.title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-white/70">
          Published: {notice.publishedAt} · Expires: {notice.expiresAt}
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <p className="text-sm font-bold text-[var(--starland-muted-text)]">
            Read Status
          </p>
          <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
            {notice.isRead ? "Marked as read" : "Unread"}
          </p>
        </div>

        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[var(--starland-dark-text)]">
          {notice.body}
        </div>

        <div className="grid gap-3 rounded-2xl border border-[var(--starland-border)] bg-white p-4 text-sm text-[var(--starland-muted-text)] sm:grid-cols-2 xl:grid-cols-4">
          <p>
            <span className="font-bold text-[var(--starland-dark-text)]">
              Created by:
            </span>{" "}
            {notice.createdBy}
          </p>
          <p>
            <span className="font-bold text-[var(--starland-dark-text)]">
              Updated by:
            </span>{" "}
            {notice.updatedBy}
          </p>
          <p>
            <span className="font-bold text-[var(--starland-dark-text)]">
              Created:
            </span>{" "}
            {notice.createdAt}
          </p>
          <p>
            <span className="font-bold text-[var(--starland-dark-text)]">
              Updated:
            </span>{" "}
            {notice.updatedAt}
          </p>
        </div>

        {notice.canManage ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/notices/${notice.noticeId}/edit`}
              className="starland-btn starland-btn-secondary"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit Notice
            </Link>

            <Link
              href={`/dashboard/notices/${notice.noticeId}/reads`}
              className="starland-btn starland-btn-soft"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Read Report
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}