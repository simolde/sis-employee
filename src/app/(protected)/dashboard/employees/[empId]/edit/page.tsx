import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EmployeeEditForm } from "@/features/employees/components/employee-edit-form";
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
  const editData = await getEmployeeEditData(empId);

  if (!editData) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Edit Employee
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Edit Employee Profile
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Update employee profile, work details, schedule, contact
            information, and attendance-related settings.
          </p>
        </div>

        <Link
          href={`/dashboard/employees/${editData.employee.empId}`}
          className="starland-btn starland-btn-secondary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Profile
        </Link>
      </div>

      <EmployeeEditForm
        employee={editData.employee}
        options={editData.options}
      />
    </section>
  );
}