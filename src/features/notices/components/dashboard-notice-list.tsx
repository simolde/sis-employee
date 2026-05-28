import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getDashboardNotices } from "../server/dashboard-notice-queries";
import { DashboardNoticeCard } from "./dashboard-notice-card";

export async function DashboardNoticeList() {
  const notices = await getDashboardNotices();

  return (
    <section className="starland-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--starland-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone
              className="h-5 w-5 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Recent Notices
            </h2>
          </div>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Latest published announcements visible to your role, branch, and
            department.
          </p>
        </div>

        <Link
          href="/dashboard/notices"
          className="starland-btn starland-btn-soft starland-btn-sm"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3 bg-[var(--starland-modern-bg)] p-4">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <DashboardNoticeCard key={notice.noticeId} notice={notice} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-white p-6 text-center">
            <p className="font-bold text-[var(--starland-dark-text)]">
              No published notices
            </p>
            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              Published announcements will appear here when available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}