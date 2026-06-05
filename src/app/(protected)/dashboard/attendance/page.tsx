import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardEdit,
  Clock3,
  ClockAlert,
  FileClock,
  History,
  Hourglass,
  MonitorSmartphone,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  TimerOff,
  type LucideIcon,
} from "lucide-react";
import { AttendanceDetailsModal } from "@/features/attendance/components/attendance-details-modal";
import { AttendanceListFilters } from "@/features/attendance/components/attendance-list-filters";
import { AttendancePagination } from "@/features/attendance/components/attendance-pagination";
import { AttendanceSummaryCards } from "@/features/attendance/components/attendance-summary-cards";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import {
  getAttendanceDetail,
  getAttendanceList,
} from "@/features/attendance/server/attendance-queries";
import { parseAttendanceListSearchParams } from "@/features/attendance/validators/attendance-list-validation";
import { getCurrentSession } from "@/features/auth/server/session";
import { canViewAllAttendance } from "@/lib/security/roles";

type AttendancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type AttendanceNavigationCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  buttonLabel: string;
  tone: "success" | "warning" | "info" | "danger";
};

const attendanceNavigationCards: AttendanceNavigationCard[] = [
  {
    title: "Attendance Actions",
    description:
      "Open the central attendance hub for attendance operations, reports, automation, absences, exceptions, and audit trails.",
    href: "/dashboard/attendance/actions",
    icon: Clock3,
    badge: "Hub",
    buttonLabel: "Open Hub",
    tone: "success",
  },
  {
    title: "EXCUSED Records",
    description:
      "Review automatic EXCUSED records from approved leave and manual EXCUSED corrections.",
    href: "/dashboard/attendance/excused",
    icon: CalendarCheck,
    badge: "EXCUSED",
    buttonLabel: "View EXCUSED",
    tone: "success",
  },
  {
    title: "EXCUSED Reconciliation",
    description:
      "Find automatic EXCUSED records no longer supported by approved leave and safely rollback eligible records.",
    href: "/dashboard/attendance/excused/reconciliation",
    icon: ShieldAlert,
    badge: "Reconcile",
    buttonLabel: "Open Reconciliation",
    tone: "warning",
  },
  {
    title: "Exception Calendar",
    description:
      "Encode holidays, suspensions, no-work dates, rest days, and branch-specific exception dates.",
    href: "/dashboard/attendance/exceptions",
    icon: CalendarDays,
    badge: "Exceptions",
    buttonLabel: "Open Exceptions",
    tone: "info",
  },
  {
    title: "Exception Audit",
    description:
      "Review create, update, and archive activity logs for attendance exception dates.",
    href: "/dashboard/attendance/exceptions/audit",
    icon: FileClock,
    badge: "Exception Logs",
    buttonLabel: "Open Exception Audit",
    tone: "info",
  },
  {
    title: "Schedule Assignment",
    description:
      "Bulk assign employee schedules so automatic attendance calculations use the correct shift rules.",
    href: "/dashboard/attendance/schedule-assignment",
    icon: CalendarClock,
    badge: "Schedules",
    buttonLabel: "Assign Schedules",
    tone: "info",
  },
  {
    title: "Attendance Generation",
    description:
      "Preview scheduled employees and safely generate automatic EXCUSED or ABSENT attendance records.",
    href: "/dashboard/attendance/absences/candidates",
    icon: ClipboardCheck,
    badge: "Generate",
    buttonLabel: "Preview Generation",
    tone: "success",
  },
  {
    title: "ABSENT Records",
    description:
      "Review generated and manual ABSENT attendance records with filters, printing, and CSV export.",
    href: "/dashboard/attendance/absences",
    icon: TimerOff,
    badge: "ABSENT",
    buttonLabel: "View ABSENT",
    tone: "danger",
  },
  {
    title: "Rollback ABSENT",
    description:
      "Safely rollback wrongly generated automatic ABSENT records while protecting manual and punched records.",
    href: "/dashboard/attendance/absences/rollback",
    icon: RotateCcw,
    badge: "Rollback",
    buttonLabel: "Open Rollback",
    tone: "danger",
  },
  {
    title: "Manual Attendance",
    description:
      "Create or correct attendance manually. Manual changes are automatically sent for HR review.",
    href: "/dashboard/attendance/manual",
    icon: ClipboardEdit,
    badge: "Manual",
    buttonLabel: "Manual Input",
    tone: "warning",
  },
  {
    title: "Review Queue",
    description:
      "Review manual attendance, manual edits, and corrections. Normal punches are excluded.",
    href: "/dashboard/attendance/review",
    icon: ClipboardCheck,
    badge: "HR Review",
    buttonLabel: "Open Queue",
    tone: "warning",
  },
  {
    title: "Status Recalculation",
    description:
      "Recalculate normal attendance status from employee schedule, shift time, and grace minutes.",
    href: "/dashboard/attendance/status-recalculation",
    icon: RefreshCw,
    badge: "Auto Status",
    buttonLabel: "Open Recalculation",
    tone: "info",
  },
  {
    title: "Missing Timeouts",
    description:
      "Manage old time-in records without time-out while preserving their original attendance source.",
    href: "/dashboard/attendance/missing-timeouts",
    icon: ClockAlert,
    badge: "Timeout",
    buttonLabel: "Open Missing",
    tone: "danger",
  },
  {
    title: "Automation",
    description:
      "Check cron setup and run attendance automation processes manually when needed.",
    href: "/dashboard/attendance/automation",
    icon: Hourglass,
    badge: "Cron",
    buttonLabel: "Open Automation",
    tone: "info",
  },
  {
    title: "Attendance Audit",
    description:
      "Track attendance changes, approvals, EXCUSED generation, ABSENT generation, and rollback logs.",
    href: "/dashboard/attendance/audit",
    icon: History,
    badge: "Audit",
    buttonLabel: "Open Audit",
    tone: "info",
  },
  {
    title: "Attendance Reports",
    description:
      "Generate filtered attendance reports with print and CSV export.",
    href: "/dashboard/attendance/reports",
    icon: BarChart3,
    badge: "Reports",
    buttonLabel: "Open Reports",
    tone: "info",
  },
  {
    title: "ODL Time In / Out",
    description:
      "Open the online distance learning employee time-in and time-out page.",
    href: "/dashboard/attendance/odl",
    icon: MonitorSmartphone,
    badge: "ODL",
    buttonLabel: "Open ODL",
    tone: "success",
  },
];

function badgeClass(
  tone: AttendanceNavigationCard["tone"],
): string {
  if (tone === "warning") {
    return "starland-badge-warning";
  }

  if (tone === "info") {
    return "starland-badge-info";
  }

  if (tone === "danger") {
    return "starland-badge-danger";
  }

  return "starland-badge-success";
}

function iconClass(
  tone: AttendanceNavigationCard["tone"],
): string {
  if (tone === "warning") {
    return "text-[var(--starland-warning)]";
  }

  if (tone === "info") {
    return "text-[var(--starland-info)]";
  }

  if (tone === "danger") {
    return "text-[var(--starland-danger)]";
  }

  return "text-[var(--starland-main-green)]";
}

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canViewAllAttendance(session.role)) {
    redirect("/dashboard/attendance/odl");
  }

  const resolvedSearchParams = await searchParams;

  const filters = parseAttendanceListSearchParams(
    resolvedSearchParams,
  );

  const [result, detail] = await Promise.all([
    getAttendanceList(filters),
    filters.detailId
      ? getAttendanceDetail(filters.detailId)
      : null,
  ]);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Attendance Management
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review employee attendance from ODL web attendance, RFID,
            biometric kiosks, approved-leave automation, manual corrections,
            and future synchronized attendance sources.
          </p>
        </div>

        <Link
          href="/dashboard/attendance/actions"
          className="starland-btn starland-btn-primary"
        >
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          Attendance Actions
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {attendanceNavigationCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.href}
              className="starland-card flex flex-col p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)]">
                  <Icon
                    className={[
                      "h-5 w-5",
                      iconClass(card.tone),
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </div>

                <span
                  className={[
                    "starland-badge",
                    badgeClass(card.tone),
                  ].join(" ")}
                >
                  {card.badge}
                </span>
              </div>

              <h2 className="mt-4 text-base font-extrabold text-[var(--starland-dark-text)]">
                {card.title}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-6 text-[var(--starland-muted-text)]">
                {card.description}
              </p>

              <Link
                href={card.href}
                className="starland-btn starland-btn-soft mt-4 w-full justify-center"
              >
                {card.buttonLabel}
              </Link>
            </article>
          );
        })}
      </section>

      <AttendanceSummaryCards summary={result.summary} />

      <AttendanceListFilters filters={result.filters} />

      <AttendanceTable
        records={result.records}
        filters={result.filters}
      />

      <AttendancePagination result={result} />

      <AttendanceDetailsModal
        detail={detail}
        closeHref="/dashboard/attendance"
      />
    </section>
  );
}