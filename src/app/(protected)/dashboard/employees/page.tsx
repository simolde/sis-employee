import Link from "next/link";
import { Plus } from "lucide-react";
import { EmployeeListFilters } from "@/features/employees/components/employee-list-filters";
import { EmployeePagination } from "@/features/employees/components/employee-pagination";
import { EmployeeSummaryCards } from "@/features/employees/components/employee-summary-cards";
import { EmployeeTable } from "@/features/employees/components/employee-table";
import { getEmployeeList } from "@/features/employees/server/employee-queries";
import { parseEmployeeListSearchParams } from "@/features/employees/validators/employee-list-validation";

type EmployeesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseEmployeeListSearchParams(resolvedSearchParams);
  const result = await getEmployeeList(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Employee Management
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Employees
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Search, filter, paginate, view, create, and manage Starland employee
            profile records.
          </p>
        </div>

        <Link
          href="/dashboard/employees/new"
          className="starland-btn starland-btn-primary"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Employee
        </Link>
      </div>

      <EmployeeSummaryCards summary={result.summary} />

      <EmployeeListFilters filters={result.filters} />

      <EmployeeTable employees={result.employees} />

      <EmployeePagination result={result} />
    </section>
  );
}