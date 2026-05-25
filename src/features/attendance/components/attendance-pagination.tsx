import Link from "next/link";
import type { AttendanceListResult } from "../types/attendance-types";

type AttendancePaginationProps = {
  result: AttendanceListResult;
};

function createPageHref(input: {
  page: number;
  result: AttendanceListResult;
}): string {
  const { filters } = input.result;
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.source !== "ALL") {
    params.set("source", filters.source);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("page", String(input.page));
  params.set("pageSize", String(filters.pageSize));

  return `/dashboard/attendance?${params.toString()}`;
}

export function AttendancePagination({ result }: AttendancePaginationProps) {
  const { pagination } = result;

  return (
    <div className="starland-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--starland-muted-text)]">
        Showing page{" "}
        <span className="font-bold text-[var(--starland-dark-text)]">
          {pagination.page}
        </span>{" "}
        of{" "}
        <span className="font-bold text-[var(--starland-dark-text)]">
          {pagination.totalPages}
        </span>{" "}
        ·{" "}
        <span className="font-bold text-[var(--starland-dark-text)]">
          {pagination.totalItems}
        </span>{" "}
        result{pagination.totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex gap-2">
        {pagination.hasPreviousPage ? (
          <Link
            href={createPageHref({
              page: Math.max(1, pagination.page - 1),
              result,
            })}
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

        {pagination.hasNextPage ? (
          <Link
            href={createPageHref({
              page: Math.min(pagination.totalPages, pagination.page + 1),
              result,
            })}
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
  );
}