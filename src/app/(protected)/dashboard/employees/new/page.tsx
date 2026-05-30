import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { getEmployeeFormOptions } from "@/features/employees/server/employee-form-options";

export default async function NewEmployeePage() {
  const options = await getEmployeeFormOptions();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Employee Management
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Add Employee
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Create a new employee profile and assign branch, department,
            designation, and employee type from Settings-managed records.
          </p>
        </div>

        <Link
          href="/dashboard/employees"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>
      </div>

      <EmployeeForm options={options} />
    </section>
  );
}