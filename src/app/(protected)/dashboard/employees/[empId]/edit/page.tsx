import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UserCog } from "lucide-react";
import { EmployeeEditForm } from "@/features/employees/components/employee-edit-form";
import { getEmployeeFormOptions } from "@/features/employees/server/employee-form-options";
import { getEmployeeEditData } from "@/features/employees/server/employee-queries";

type EmployeeEditPageProps = {
  params: Promise<{
    empId: string;
  }>;
};

export default async function EmployeeEditPage({
  params,
}: EmployeeEditPageProps) {
  const { empId } = await params;

  const [editData, options] = await Promise.all([
    getEmployeeEditData(empId),
    getEmployeeFormOptions(),
  ]);

  if (!editData) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Employee Management
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Edit Employee
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Update employee profile, work assignment, employment details, and
            current schedule.
          </p>
        </div>

        <Link
          href={`/dashboard/employees/${editData.employee.empId}`}
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Profile
        </Link>
      </div>

      <section className="starland-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
            <UserCog className="h-6 w-6" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Employee Update
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
              Changes to schedule assignment will update the employee current
              schedule and preserve schedule assignment history.
            </p>
          </div>
        </div>
      </section>

      <EmployeeEditForm employee={editData.employee} options={options} />
    </section>
  );
}