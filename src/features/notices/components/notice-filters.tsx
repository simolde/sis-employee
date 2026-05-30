import Link from "next/link";
import type { NoticeListSearchParams } from "../types/notice-types";

type NoticeFiltersProps = {
  filters: NoticeListSearchParams;
  canManage: boolean;
};

export function NoticeFilters({ filters, canManage }: NoticeFiltersProps) {
  return (
    <section className="starland-card p-5">
      <form className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr_auto_auto] lg:items-end">
        <div>
          <label
            htmlFor="q"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Search
          </label>
          <input
            id="q"
            name="q"
            className="starland-input mt-2"
            placeholder="Search title or body"
            defaultValue={filters.q}
          />
        </div>

        {canManage ? (
          <>
            <div>
              <label
                htmlFor="status"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                className="starland-input mt-2"
                defaultValue={filters.status}
              >
                <option value="ANY">Any Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="audience"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Audience
              </label>
              <select
                id="audience"
                name="audience"
                className="starland-input mt-2"
                defaultValue={filters.audience}
              >
                <option value="ANY">Any Audience</option>
                <option value="ALL">All Roles</option>
                <option value="HR_ADMIN">HR / Admin</option>
                <option value="HEADS">Heads</option>
                <option value="STAFF_FACULTY_MAINTENANCE">
                  Staff / Faculty / Maintenance
                </option>
              </select>
            </div>
          </>
        ) : (
          <>
            <input type="hidden" name="status" value="ANY" />
            <input type="hidden" name="audience" value="ANY" />
          </>
        )}

        <div>
          <label
            htmlFor="pageSize"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Page Size
          </label>
          <select
            id="pageSize"
            name="pageSize"
            className="starland-input mt-2"
            defaultValue={filters.pageSize}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <input type="hidden" name="page" value="1" />

        <button type="submit" className="starland-btn starland-btn-primary">
          Apply
        </button>

        <Link
          href="/dashboard/notices"
          className="starland-btn starland-btn-soft"
        >
          Reset
        </Link>
      </form>
    </section>
  );
}