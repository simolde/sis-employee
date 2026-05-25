import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import type { EmployeeListItem } from "../types/employee-types";
import { EmployeeStatusBadge } from "./employee-status-badge";

type EmployeeTableProps = {
  employees: EmployeeListItem[];
};

export function EmployeeTable({ employees }: EmployeeTableProps) {
  return (
    <div className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Employee Records
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Search results are loaded with server-side pagination.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee No.</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Branch</th>
              <th>Contact</th>
              <th>Date Hired</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee.empId}>
                  <td className="font-bold text-[var(--starland-main-green)]">
                    {employee.empNumber}
                  </td>
                  <td>
                    <div>
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        {employee.fullName}
                      </p>
                      <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                        {employee.email}
                      </p>
                    </div>
                  </td>
                  <td>{employee.departmentName}</td>
                  <td>{employee.designationName}</td>
                  <td>{employee.branchName}</td>
                  <td>{employee.phone}</td>
                  <td>{employee.dateHired}</td>
                  <td>
                    <EmployeeStatusBadge status={employee.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/employees/${employee.empId}`}
                        className="starland-btn starland-btn-secondary starland-btn-sm"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View
                      </Link>

                      <Link
                        href={`/dashboard/employees/${employee.empId}/edit`}
                        className="starland-btn starland-btn-soft starland-btn-sm"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No employee records found
                    </p>
                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Try changing the search keyword or status filter.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}