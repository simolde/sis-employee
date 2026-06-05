import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardEdit,
  Clock3,
  ClockAlert,
  FileClock,
  FileSpreadsheet,
  History,
  Hourglass,
  MonitorSmartphone,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Timer,
  TimerOff,
  type LucideIcon,
} from "lucide-react";
import {
  AttendanceActionCard,
  type AttendanceActionCardTone,
} from "@/features/attendance/components/attendance-action-card";
import { getApprovedLeaveExcusedSyncOverview } from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-overview";
import { getAttendanceActionHubStats } from "@/features/attendance/server/attendance-action-hub-queries";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";

type ActionCardDefinition = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  buttonLabel: string;
  statLabel: string;
  statValue: number;
  tone: AttendanceActionCardTone;
};

type SummaryCardDefinition = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: AttendanceActionCardTone;
};

function summaryIconClass(
  tone: AttendanceActionCardTone,
): string {
  switch (tone) {
    case "warning":
      return "text-[var(--starland-warning)]";

    case "info":
      return "text-[var(--starland-info)]";

    case "danger":
      return "text-[var(--starland-danger)]";

    default:
      return "text-[var(--starland-success)]";
  }
}

export default async function AttendanceActionsPage() {
  await requireCanManageEmployees();

  const [stats, approvedLeaveSync] =
    await Promise.all([
      getAttendanceActionHubStats(),
      getApprovedLeaveExcusedSyncOverview(),
    ]);

  const summaryCards: SummaryCardDefinition[] = [
    {
      label: "Attendance Today",
      value: stats.totalToday,
      description:
        "All attendance records for today.",
      icon: Clock3,
      tone: "info",
    },
    {
      label: "On Time Today",
      value: stats.onTimeToday,
      description:
        "Employees currently marked ON TIME.",
      icon: ShieldCheck,
      tone: "success",
    },
    {
      label: "Late Today",
      value: stats.lateToday,
      description:
        "Employees currently marked LATE.",
      icon: Timer,
      tone: "warning",
    },
    {
      label: "EXCUSED Today",
      value: stats.excusedToday,
      description:
        "Approved-leave or manual EXCUSED records.",
      icon: CalendarCheck,
      tone: "success",
    },
    {
      label: "Missing EXCUSED",
      value:
        approvedLeaveSync.missingExcusedCandidates,
      description: `${approvedLeaveSync.dateFrom} through ${approvedLeaveSync.dateTo}.`,
      icon: RefreshCw,
      tone: "warning",
    },
    {
      label: "Stale EXCUSED",
      value:
        stats.excusedReconciliationEligible,
      description:
        "Automatic EXCUSED records eligible for reconciliation.",
      icon: ShieldAlert,
      tone: "warning",
    },
    {
      label: "Open Review",
      value: stats.openReview,
      description:
        "Manual changes awaiting HR action.",
      icon: ClipboardCheck,
      tone: "warning",
    },
    {
      label: "Absent Today",
      value: stats.absentToday,
      description:
        "Attendance records currently marked ABSENT.",
      icon: TimerOff,
      tone: "danger",
    },
  ];

  const actionCards: ActionCardDefinition[] = [
    {
      title: "Approved Leave Sync",
      description:
        "Find approved-leave workdays without attendance and generate the missing automatic EXCUSED records.",
      href: "/dashboard/attendance/excused/sync",
      icon: RefreshCw,
      badge: "Live Sync",
      buttonLabel: "Open Approved Leave Sync",
      statLabel: "Missing EXCUSED",
      statValue:
        approvedLeaveSync.missingExcusedCandidates,
      tone: "warning",
    },
    {
      title: "Attendance List",
      description:
        "View all RFID, biometric, kiosk, ODL, automatic, and manual attendance records.",
      href: "/dashboard/attendance",
      icon: Clock3,
      badge: "Records",
      buttonLabel: "Open Attendance",
      statLabel: "Today",
      statValue: stats.totalToday,
      tone: "success",
    },
    {
      title: "EXCUSED Records",
      description:
        "Review automatic approved-leave EXCUSED records and manual EXCUSED corrections.",
      href: "/dashboard/attendance/excused",
      icon: CalendarCheck,
      badge: "EXCUSED",
      buttonLabel: "View EXCUSED Records",
      statLabel: "Total EXCUSED",
      statValue: stats.excusedTotal,
      tone: "success",
    },
    {
      title: "EXCUSED Reconciliation",
      description:
        "Find stale automatic EXCUSED records and safely rollback verified records.",
      href: "/dashboard/attendance/excused/reconciliation",
      icon: ShieldAlert,
      badge: "Reconcile",
      buttonLabel: "Open Reconciliation",
      statLabel: "Rollback Eligible",
      statValue:
        stats.excusedReconciliationEligible,
      tone: "warning",
    },
    {
      title: "EXCUSED Automation Audit",
      description:
        "Review approved-leave generation and reconciliation rollback activity.",
      href: "/dashboard/attendance/excused/audit",
      icon: FileClock,
      badge: "EXCUSED Logs",
      buttonLabel: "Open EXCUSED Audit",
      statLabel: "Automation Logs",
      statValue:
        stats.excusedAutomationAuditLogs,
      tone: "info",
    },
    {
      title: "Exception Calendar",
      description:
        "Manage holidays, suspensions, no-work dates, rest days, and branch-specific exceptions.",
      href: "/dashboard/attendance/exceptions",
      icon: CalendarDays,
      badge: "Exceptions",
      buttonLabel: "Open Exceptions",
      statLabel: "Active Exceptions",
      statValue:
        stats.activeAttendanceExceptions,
      tone: "info",
    },
    {
      title: "Exception Audit",
      description:
        "Review exception create, update, and archive activity logs.",
      href: "/dashboard/attendance/exceptions/audit",
      icon: FileClock,
      badge: "Exception Logs",
      buttonLabel: "Open Exception Audit",
      statLabel: "Audit Logs",
      statValue: stats.exceptionAuditLogs,
      tone: "info",
    },
    {
      title: "Schedule Assignment",
      description:
        "Bulk assign employee schedules before automatic status and absence processing.",
      href: "/dashboard/attendance/schedule-assignment",
      icon: CalendarClock,
      badge: "Schedules",
      buttonLabel: "Assign Schedules",
      statLabel: "Attendance Today",
      statValue: stats.totalToday,
      tone: "info",
    },
    {
      title: "Attendance Generation",
      description:
        "Preview scheduled employees and safely generate automatic EXCUSED or ABSENT records.",
      href: "/dashboard/attendance/absences/candidates",
      icon: ClipboardCheck,
      badge: "Generate",
      buttonLabel: "Preview Generation",
      statLabel: "EXCUSED Today",
      statValue: stats.excusedToday,
      tone: "success",
    },
    {
      title: "ABSENT Records",
      description:
        "Review automatic and manual ABSENT records with filters, printing, and export.",
      href: "/dashboard/attendance/absences",
      icon: TimerOff,
      badge: "ABSENT",
      buttonLabel: "View ABSENT Records",
      statLabel: "Total ABSENT",
      statValue: stats.absentTotal,
      tone: "danger",
    },
    {
      title: "Rollback ABSENT",
      description:
        "Rollback wrongly generated automatic ABSENT records without punch data.",
      href: "/dashboard/attendance/absences/rollback",
      icon: RotateCcw,
      badge: "Rollback",
      buttonLabel: "Open Rollback",
      statLabel: "Rollback Eligible",
      statValue:
        stats.rollbackEligibleAbsent,
      tone: "danger",
    },
    {
      title: "Manual Attendance Input",
      description:
        "Create or correct attendance manually. Manual changes require HR review.",
      href: "/dashboard/attendance/manual",
      icon: ClipboardEdit,
      badge: "Manual",
      buttonLabel: "Manual Input",
      statLabel: "Manual Today",
      statValue: stats.manualToday,
      tone: "warning",
    },
    {
      title: "Attendance Review Queue",
      description:
        "Review manual attendance, edits, and corrections while excluding normal punches.",
      href: "/dashboard/attendance/review",
      icon: ClipboardCheck,
      badge: "HR Review",
      buttonLabel: "Open Review Queue",
      statLabel: "Open Review",
      statValue: stats.openReview,
      tone: "warning",
    },
    {
      title: "Status Recalculation",
      description:
        "Recalculate attendance status using employee schedules, shifts, and grace minutes.",
      href: "/dashboard/attendance/status-recalculation",
      icon: RefreshCw,
      badge: "Auto Status",
      buttonLabel: "Open Recalculation",
      statLabel: "Attendance Today",
      statValue: stats.totalToday,
      tone: "info",
    },
    {
      title: "Missing Timeout Management",
      description:
        "Manage attendance records with time-in but no recorded time-out.",
      href: "/dashboard/attendance/missing-timeouts",
      icon: ClockAlert,
      badge: "Timeout",
      buttonLabel: "Open Missing Timeouts",
      statLabel: "Missing Timeout",
      statValue: stats.missingTimeout,
      tone: "danger",
    },
    {
      title: "Attendance Automation",
      description:
        "Review and run attendance automation processes and scheduled operations.",
      href: "/dashboard/attendance/automation",
      icon: Hourglass,
      badge: "Automation",
      buttonLabel: "Open Automation",
      statLabel: "Missing EXCUSED",
      statValue:
        approvedLeaveSync.missingExcusedCandidates,
      tone: "info",
    },
    {
      title: "Attendance Audit Trail",
      description:
        "Track attendance changes, approvals, generation, recalculation, and rollback.",
      href: "/dashboard/attendance/audit",
      icon: History,
      badge: "Audit",
      buttonLabel: "Open Audit Trail",
      statLabel: "Audit Logs",
      statValue: stats.attendanceAuditLogs,
      tone: "info",
    },
    {
      title: "Attendance Reports",
      description:
        "Generate filtered attendance reports with printing and CSV export.",
      href: "/dashboard/attendance/reports",
      icon: FileSpreadsheet,
      badge: "Reports",
      buttonLabel: "Open Reports",
      statLabel: "Pending Review",
      statValue: stats.pendingReview,
      tone: "info",
    },
    {
      title: "ODL Time In / Out",
      description:
        "Open employee online distance learning time-in and time-out.",
      href: "/dashboard/attendance/odl",
      icon: MonitorSmartphone,
      badge: "ODL",
      buttonLabel: "Open ODL Attendance",
      statLabel: "WEB Today",
      statValue: stats.webToday,
      tone: "success",
    },
  ];

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Attendance Hub
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Actions
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Manage attendance, approved-leave
            synchronization, EXCUSED records,
            schedules, exceptions, ABSENT records,
            reviews, automation, reports, and audit
            trails.
          </p>
        </div>

        <Link
          href="/dashboard/attendance"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />
          Back to Attendance
        </Link>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Live Attendance Snapshot
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Attendance and Approved-Leave Sync
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Missing EXCUSED records are evaluated
            from approved leave within the current
            thirty-day past and future monitoring
            window.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
              >
                <Icon
                  className={[
                    "h-7 w-7",
                    summaryIconClass(card.tone),
                  ].join(" ")}
                  aria-hidden="true"
                />

                <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
                  {card.label}
                </p>

                <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
                  {card.value}
                </p>

                <p className="mt-2 text-xs font-semibold leading-5 text-[var(--starland-muted-text)]">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {actionCards.map((card) => (
          <AttendanceActionCard
            key={card.href}
            {...card}
          />
        ))}
      </section>
    </section>
  );
}