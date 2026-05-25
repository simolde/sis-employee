import {
  AlertTriangle,
  CalendarCheck,
  Clock3,
  UserCheck,
  Users,
} from "lucide-react";
import { DashboardCard } from "./dashboard-card";

const dashboardStats = [
  {
    title: "Total Employees",
    value: "0",
    helper: "Employees will appear after records are added.",
    tone: "info" as const,
    icon: <Users className="h-6 w-6" aria-hidden="true" />,
  },
  {
    title: "Active Employees",
    value: "0",
    helper: "Active staff, faculty, and maintenance.",
    tone: "success" as const,
    icon: <UserCheck className="h-6 w-6" aria-hidden="true" />,
  },
  {
    title: "On-Time Today",
    value: "0",
    helper: "Calculated from schedule start time.",
    tone: "success" as const,
    icon: <CalendarCheck className="h-6 w-6" aria-hidden="true" />,
  },
  {
    title: "Late Today",
    value: "0",
    helper: "Includes grace period calculation.",
    tone: "warning" as const,
    icon: <Clock3 className="h-6 w-6" aria-hidden="true" />,
  },
  {
    title: "Pending Review",
    value: "0",
    helper: "Manual edits and attendance exceptions.",
    tone: "danger" as const,
    icon: <AlertTriangle className="h-6 w-6" aria-hidden="true" />,
  },
];

export function DashboardSummary() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {dashboardStats.map((stat) => (
        <DashboardCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          helper={stat.helper}
          tone={stat.tone}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}