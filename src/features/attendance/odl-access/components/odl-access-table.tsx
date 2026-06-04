import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { OdlAccessToggleForm } from "./odl-access-toggle-form";
import type {
  OdlAccessFilters,
  OdlAccessResult,
} from "../types/odl-access-types";

type OdlAccessTableProps = {
  result: OdlAccessResult;
};

function buildPageHref(filters: OdlAccessFilters, page: number): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.access !== "ALL") {
    params.set("access", filters.access);
  }

  params.set("page", String(page));

  return `/dashboard/attendance/odl/access?${params.toString()}`;
}

function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

function employeeStatusBadgeClass(status: string): string {
  if (status === "ACTIVE") {
    return "starland-badge-success";
  }

  if (status === "INACTIVE") {
    return "starland-badge-warning";
  }

  return "starland-badge-info";
}

export function OdlAccessTable({ result }: OdlAccessTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Employee ODL Access
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Toggle the Flexible flag to enable or disable ODL web attendance
          access for each employee.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Profile</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>ODL Access</th>
              <th>Action</th>
              <th>Open</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((employee) => (
                <tr key={employee.empId}>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {employee.fullName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {employee.empNumber}
                    </p>
                  </td>

                  <td>
                    <p>{employee.departmentName}</p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {employee.designationName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      Type: {employee.employeeTypeName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      Branch: {employee.branchName}
                    </p>
                  </td>

                  <td>{employee.scheduleName}</td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        employeeStatusBadgeClass(employee.status),
                      ].join(" ")}
                    >
                      {formatStatusLabel(employee.status)}
                    </span>
                  </td>

                  <td>
                    {employee.isFlexible ? (
                      <span className="starland-badge starland-badge-success">
                        ENABLED
                      </span>
                    ) : (
                      <span className="starland-badge starland-badge-warning">
                        DISABLED
                      </span>
                    )}
                  </td>

                  <td>
                    <OdlAccessToggleForm employee={employee} />
                  </td>

                  <td>
                    <Link
                      href={`/dashboard/employees/${employee.empId}`}
                      className="starland-btn starland-btn-soft starland-btn-sm"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No employees found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Try changing the search or access filter.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--starland-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--starland-muted-text)]">
          Page {result.pagination.page} of {result.pagination.totalPages} ·{" "}
          {result.pagination.totalItems} employee(s)
        </p>

        <div className="flex gap-2">
          <Link
            href={buildPageHref(result.filters, result.pagination.page - 1)}
            aria-disabled={!result.pagination.hasPreviousPage}
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination.hasPreviousPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Link>

          <Link
            href={buildPageHref(result.filters, result.pagination.page + 1)}
            aria-disabled={!result.pagination.hasNextPage}
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination.hasNextPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}