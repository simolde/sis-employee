import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { getEmployeeCreateFormOptions } from "@/features/employees/server/employee-queries";

export default async function NewEmployeePage() {
  const options = await getEmployeeCreateFormOptions();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Create Employee
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            New Employee
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Create a Starland employee profile with branch, department,
            designation, schedule, contact details, and attendance-related
            settings.
          </p>
        </div>

        <Link
          href="/dashboard/employees"
          className="starland-btn starland-btn-secondary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Employees
        </Link>
      </div>

      <EmployeeForm options={options} />
    </section>
  );
}