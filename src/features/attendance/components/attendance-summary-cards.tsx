import { AlertTriangle, CalendarCheck, Clock3, FileClock } from "lucide-react";
import type { AttendanceSummary } from "../types/attendance-types";

type AttendanceSummaryCardsProps = {
  summary: AttendanceSummary;
};

const cardItems = [
  {
    key: "totalToday",
    title: "Total Today",
    helper: "All attendance records today",
    icon: FileClock,
    toneClass: "bg-sky-50 text-[var(--starland-info)]",
  },
  {
    key: "onTimeToday",
    title: "On-Time Today",
    helper: "Within assigned schedule",
    icon: CalendarCheck,
    toneClass: "bg-green-50 text-[var(--starland-success)]",
  },
  {
    key: "lateToday",
    title: "Late Today",
    helper: "Beyond grace period",
    icon: Clock3,
    toneClass: "bg-amber-50 text-[var(--starland-warning)]",
  },
  {
    key: "pendingReview",
    title: "Pending Review",
    helper: "Needs HR/Admin checking",
    icon: AlertTriangle,
    toneClass: "bg-red-50 text-[var(--starland-danger)]",
  },
] as const;

export function AttendanceSummaryCards({
  summary,
}: AttendanceSummaryCardsProps) {
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