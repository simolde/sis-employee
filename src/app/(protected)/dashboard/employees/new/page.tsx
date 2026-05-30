import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
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
            designation, employee type, and schedule using active Settings
            records.
          </p>
        </div>

        <Link
          href="/dashboard/employees"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Employees
        </Link>
      </div>

      <section className="starland-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
            <UserPlus className="h-6 w-6" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Employee Registration
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
              Complete the employee details below. If a branch, department,
              designation, employee type, or schedule is missing, add it first
              from Settings.
            </p>
          </div>
        </div>
      </section>

      <EmployeeForm options={options} />
    </section>
  );
}