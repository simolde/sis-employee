import { BriefcaseBusiness, UserCheck, UserRoundX, Users } from "lucide-react";
import type { EmployeeListSummary } from "../types/employee-types";

type EmployeeSummaryCardsProps = {
  summary: EmployeeListSummary;
};

const cardItems = [
  {
    key: "totalEmployees",
    title: "Total Employees",
    helper: "All employee profile records",
    icon: Users,
    toneClass: "bg-sky-50 text-[var(--starland-info)]",
  },
  {
    key: "activeEmployees",
    title: "Active",
    helper: "Currently active employees",
    icon: UserCheck,
    toneClass: "bg-green-50 text-[var(--starland-success)]",
  },
  {
    key: "inactiveEmployees",
    title: "Inactive",
    helper: "Inactive employee accounts",
    icon: UserRoundX,
    toneClass: "bg-slate-100 text-slate-600",
  },
  {
    key: "onLeaveEmployees",
    title: "On Leave",
    helper: "Employees currently on leave",
    icon: BriefcaseBusiness,
    toneClass: "bg-amber-50 text-[var(--starland-warning)]",
  },
] as const;

export function EmployeeSummaryCards({ summary }: EmployeeSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardItems.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.key} className="starland-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[var(--starland-muted-text)]">
                  {item.title}
                </p>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
                  {summary[item.key]}
                </p>
                <p className="mt-2 text-xs font-medium text-[var(--starland-muted-text)]">
                  {item.helper}
                </p>
              </div>

              <div
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  item.toneClass,
                ].join(" ")}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}