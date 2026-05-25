import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { EmployeeAccountCard } from "@/features/employees/components/employee-account-card";
import { EmployeeAttendanceSummary } from "@/features/employees/components/employee-attendance-summary";
import { EmployeeDetailCard } from "@/features/employees/components/employee-detail-card";
import { EmployeeEducationCard } from "@/features/employees/components/employee-education-card";
import { EmployeeFamilyBackgroundCard } from "@/features/employees/components/employee-family-background-card";
import { EmployeeRecentAttendanceTable } from "@/features/employees/components/employee-recent-attendance-table";
import { EmployeeRfidCard } from "@/features/employees/components/employee-rfid-card";
import { EmployeeWorkContractCard } from "@/features/employees/components/employee-work-contract-card";
import { getEmployeeDetail } from "@/features/employees/server/employee-detail-queries";

type EmployeeDetailPageProps = {
  params: Promise<{
    empId: string;
  }>;
};

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { empId } = await params;
  const employee = await getEmployeeDetail(empId);

  if (!employee) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Employee Detail
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Employee Profile
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            View profile, family background, education, work experience,
            contract signing, account security, RFID cards, and attendance
            records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/employees"
            className="starland-btn starland-btn-secondary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>

          <Link
            href={`/dashboard/employees/${employee.profile.empId}/edit`}
            className="starland-btn starland-btn-primary"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit Profile
          </Link>
        </div>
      </div>

      <EmployeeDetailCard employee={employee} />

      <EmployeeFamilyBackgroundCard
        familyBackground={employee.familyBackground}
        children={employee.children}
      />

      <EmployeeEducationCard education={employee.education} />

      <EmployeeWorkContractCard
        workExperiences={employee.workExperiences}
        contract={employee.contract}
      />

      <EmployeeAttendanceSummary summary={employee.attendanceSummary} />

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <EmployeeAccountCard employee={employee} />
        <EmployeeRfidCard rfidCards={employee.rfidCards} />
      </div>

      <EmployeeRecentAttendanceTable records={employee.recentAttendance} />
    </section>
  );
}