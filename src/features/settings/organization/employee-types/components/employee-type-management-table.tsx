import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  EmployeeTypeListData,
  EmployeeTypeStatus,
} from "../types/employee-type-management-types";
import { EmployeeTypeRowActions } from "./employee-type-row-actions";

type EmployeeTypeManagementTableProps = {
  data: EmployeeTypeListData;
};

function statusBadgeClass(
  status: EmployeeTypeStatus,
): string {
  switch (status) {
    case "ACTIVE":
      return "starland-badge-success";

    case "INACTIVE":
      return "starland-badge-warning";

    case "ARCHIVED":
      return "bg-slate-100 text-slate-700";
  }
}

function paginationHref(
  data: EmployeeTypeListData,
  page: number,
): string {
  const parameters =
    new URLSearchParams();

  if (data.filters.q) {
    parameters.set(
      "q",
      data.filters.q,
    );
  }

  if (data.filters.status) {
    parameters.set(
      "status",
      data.filters.status,
    );
  }

  parameters.set(
    "page",
    String(page),
  );

  parameters.set(
    "pageSize",
    String(data.filters.pageSize),
  );

  return (
    "/dashboard/settings/organization/employee-types?" +
    parameters.toString()
  );
}

export function EmployeeTypeManagementTable({
  data,
}: EmployeeTypeManagementTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Employment Classifications
        </h2>

        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Showing{" "}
          {data.pagination.firstRecord}–
          {data.pagination.lastRecord} of{" "}
          {data.pagination.totalRecords} matching
          records.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.employeeTypes.length > 0 ? (
              data.employeeTypes.map(
                (employeeType) => (
                  <tr
                    key={
                      employeeType.empTypeId
                    }
                  >
                    <td>
                      <p className="font-extrabold text-[var(--starland-dark-text)]">
                        {employeeType.name}
                      </p>

                      <code className="mt-1 block text-xs font-bold text-[var(--starland-muted-text)]">
                        {
                          employeeType.empTypeCode
                        }
                      </code>

                      <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                        ID:{" "}
                        {employeeType.empTypeId}
                      </p>
                    </td>

                    <td>
                      <span
                        className={[
                          "starland-badge",
                          statusBadgeClass(
                            employeeType.status,
                          ),
                        ].join(" ")}
                      >
                        {employeeType.status}
                      </span>
                    </td>

                    <td>
                      <p className="min-w-44 text-sm">
                        {employeeType.createdAt}
                      </p>
                    </td>

                    <td>
                      <p className="min-w-44 text-sm">
                        {employeeType.updatedAt}
                      </p>
                    </td>

                    <td>
                      <EmployeeTypeRowActions
                        empTypeId={
                          employeeType.empTypeId
                        }
                        employeeTypeName={
                          employeeType.name
                        }
                        status={
                          employeeType.status
                        }
                      />
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="p-8 text-center">
                    <p className="font-extrabold text-[var(--starland-dark-text)]">
                      No employee types found
                    </p>

                    <p className="mt-2 text-sm text-[var(--starland-muted-text)]">
                      Change the filters or create a
                      new employee type.
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
          Page {data.pagination.page} of{" "}
          {data.pagination.totalPages}
        </p>

        <div className="flex gap-2">
          {data.pagination
            .hasPreviousPage ? (
            <Link
              href={paginationHref(
                data,
                data.pagination.page - 1,
              )}
              className="starland-btn starland-btn-soft starland-btn-sm"
            >
              <ChevronLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Previous
            </Link>
          ) : (
            <span className="starland-btn starland-btn-soft starland-btn-sm pointer-events-none opacity-50">
              <ChevronLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Previous
            </span>
          )}

          {data.pagination
            .hasNextPage ? (
            <Link
              href={paginationHref(
                data,
                data.pagination.page + 1,
              )}
              className="starland-btn starland-btn-soft starland-btn-sm"
            >
              Next

              <ChevronRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <span className="starland-btn starland-btn-soft starland-btn-sm pointer-events-none opacity-50">
              Next

              <ChevronRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>
          )}
        </div>
      </div>
    </section>
  );
}