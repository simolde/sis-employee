"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Loader2, Megaphone, X } from "lucide-react";
import type {
  MarkTopbarNoticesReadResponse,
  TopbarNoticeItem,
  TopbarNoticeResponse,
} from "../types/topbar-notice-types";

function formatAudience(value: string): string {
  return value.replaceAll("_", " ");
}

export function TopbarNoticeBell() {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hasMarkedCurrentBatchRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notices, setNotices] = useState<TopbarNoticeItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const response = await fetch("/api/topbar", {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as TopbarNoticeResponse;

        if (!isMounted) {
          return;
        }

        if (!response.ok || !result.ok) {
          setNotices([]);
          setUnreadCount(0);
          return;
        }

        setNotices(result.notices);
        setUnreadCount(result.unreadCount);
      } catch {
        if (!isMounted) {
          return;
        }

        setNotices([]);
        setUnreadCount(0);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function markLoadedNoticesAsRead() {
    const unreadNoticeIds = notices
      .filter((notice) => !notice.isRead)
      .map((notice) => notice.noticeId);

    if (unreadNoticeIds.length === 0 || hasMarkedCurrentBatchRef.current) {
      return;
    }

    hasMarkedCurrentBatchRef.current = true;

    try {
      const response = await fetch("/api/topbar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          noticeIds: unreadNoticeIds,
        }),
      });

      const result = (await response.json()) as MarkTopbarNoticesReadResponse;

      if (!response.ok || !result.ok) {
        return;
      }

      setUnreadCount(result.unreadCount);
      setNotices((currentNotices) =>
        currentNotices.map((notice) =>
          unreadNoticeIds.includes(notice.noticeId)
            ? {
                ...notice,
                isRead: true,
              }
            : notice,
        ),
      );
    } catch {
      hasMarkedCurrentBatchRef.current = false;
    }
  }

  function handleToggleNotices() {
    const nextOpenState = !isOpen;

    setIsOpen(nextOpenState);

    if (nextOpenState) {
      void markLoadedNoticesAsRead();
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--starland-border)] bg-white text-[var(--starland-dark-text)] shadow-sm transition hover:bg-[var(--starland-modern-bg)]"
        aria-label="Open notices"
        aria-expanded={isOpen}
        onClick={handleToggleNotices}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--starland-danger)] px-1 text-[10px] font-extrabold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,420px)] overflow-hidden rounded-3xl border border-[var(--starland-border)] bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--starland-border)] bg-[var(--starland-deep-green)] p-4 text-white">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" aria-hidden="true" />
                <h2 className="text-sm font-extrabold">Recent Notices</h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-white/70">
                Unread notices are marked as read when opened.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close notices"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto bg-[var(--starland-modern-bg)] p-3">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--starland-muted-text)]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading notices...
              </div>
            ) : null}

            {!isLoading && notices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-white p-6 text-center">
                <p className="font-bold text-[var(--starland-dark-text)]">
                  No recent notices
                </p>
                <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                  New announcements will appear here.
                </p>
              </div>
            ) : null}

            {!isLoading && notices.length > 0 ? (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <article
                    key={notice.noticeId}
                    className={[
                      "rounded-2xl border bg-white p-4",
                      notice.isRead
                        ? "border-[var(--starland-border)]"
                        : "border-[var(--starland-success)] ring-2 ring-green-100",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "starland-badge",
                          notice.isRead
                            ? "starland-badge-info"
                            : "starland-badge-success",
                        ].join(" ")}
                      >
                        {notice.isRead ? "Read" : "Unread"}
                      </span>
                      <span className="starland-badge starland-badge-info">
                        {formatAudience(notice.audience)}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/notices/${notice.noticeId}`}
                      className="mt-3 block text-sm font-extrabold text-[var(--starland-dark-text)] hover:text-[var(--starland-main-green)] hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      {notice.title}
                    </Link>

                    <p className="mt-2 text-xs leading-5 text-[var(--starland-muted-text)]">
                      {notice.bodyPreview}
                    </p>

                    <div className="mt-3 grid gap-1 text-[11px] font-semibold text-[var(--starland-muted-text)]">
                      <p>Branch: {notice.branchName}</p>
                      <p>Department: {notice.departmentName}</p>
                      <p>Published: {notice.publishedAt}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <div className="border-t border-[var(--starland-border)] bg-white p-3">
            <Link
              href="/dashboard/notices"
              className="starland-btn starland-btn-primary w-full"
              onClick={() => setIsOpen(false)}
            >
              View All Notices
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}