import Link from "next/link";
import type { EmployeeListResult } from "../types/employee-types";

type EmployeePaginationProps = {
  result: EmployeeListResult;
};

function createPageHref(input: {
  page: number;
  q: string;
  status: string;
  pageSize: number;
}) {
  const params = new URLSearchParams();

  if (input.q) {
    params.set("q", input.q);
  }

  if (input.status !== "ALL") {
    params.set("status", input.status);
  }

  params.set("page", String(input.page));
  params.set("pageSize", String(input.pageSize));

  return `/dashboard/employees?${params.toString()}`;
}

export function EmployeePagination({ result }: EmployeePaginationProps) {
  const { filters, pagination } = result;

  const previousHref = createPageHref({
    page: Math.max(1, pagination.page - 1),
    q: filters.q,
    status: filters.status,
    pageSize: filters.pageSize,
  });

  const nextHref = createPageHref({
    page: Math.min(pagination.totalPages, pagination.page + 1),
    q: filters.q,
    status: filters.status,
    pageSize: filters.pageSize,
  });

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
            href={previousHref}
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
            href={nextHref}
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