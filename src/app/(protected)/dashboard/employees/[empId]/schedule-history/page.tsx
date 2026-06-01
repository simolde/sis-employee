import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
} from "lucide-react";
import { EmployeeScheduleHistoryActions } from "@/features/employees/components/employee-schedule-history-actions";
import { EmployeeScheduleHistoryTable } from "@/features/employees/components/employee-schedule-history-table";
import { getEmployeeScheduleHistoryData } from "@/features/employees/server/employee-schedule-history-queries";

type EmployeeScheduleHistoryPageProps = {
  params: Promise<{
    empId: string;
  }>;
};

export default async function EmployeeScheduleHistoryPage({
  params,
}: EmployeeScheduleHistoryPageProps) {
  const { empId } = await params;
  const data = await getEmployeeScheduleHistoryData(empId);

  if (!data) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Employee Schedule
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Schedule History
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review the employee current schedule and all previous schedule
            assignments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <EmployeeScheduleHistoryActions data={data} />

          <Link
            href={`/dashboard/employees/${data.employee.empId}/edit`}
            className="starland-btn starland-btn-primary"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Change Schedule
          </Link>

          <Link
            href={`/dashboard/employees/${data.employee.empId}`}
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Profile
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {data.employee.empNumber}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {data.employee.branchName}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {data.employee.departmentName}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {data.employee.designationName}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {data.employee.fullName}
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/70">
            Current Schedule: {data.employee.currentScheduleCode} ·{" "}
            {data.employee.currentScheduleName}
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Current Schedule
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {data.employee.currentScheduleName}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Current Shift
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {data.employee.currentShiftName}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              {data.employee.currentShiftTime}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Assignments
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.totalAssignments}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Active Assignments
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.activeAssignments}
            </p>
          </article>
        </div>
      </section>

      <EmployeeScheduleHistoryTable data={data} />
    </section>
  );
}