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
  ShieldCheck,
  Timer,
  TimerOff,
  type LucideIcon,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { getAttendanceActionHubStats } from "@/features/attendance/server/attendance-action-hub-queries";

type AttendanceActionCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  buttonLabel: string;
  statLabel: string;
  statValue: number;
  tone:
    | "success"
    | "warning"
    | "info"
    | "danger";
};

type AttendancePolicyCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone:
    | "success"
    | "warning"
    | "info"
    | "danger";
};

function iconToneClass(
  tone: AttendancePolicyCard["tone"],
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

  return "text-[var(--starland-success)]";
}

function badgeToneClass(
  tone: AttendanceActionCard["tone"],
): string {
  if (tone === "warning") {
    return "starland-badge-warning";
  }

  if (tone === "danger") {
    return "starland-badge-danger";
  }

  if (tone === "info") {
    return "starland-badge-info";
  }

  return "starland-badge-success";
}

export default async function AttendanceActionsPage() {
  await requireCanManageEmployees();

  const stats =
    await getAttendanceActionHubStats();

  const policyCards: AttendancePolicyCard[] = [
    {
      title: "Normal Attendance",
      description:
        "RFID, biometric, kiosk, and ODL punches do not require HR review unless manually changed.",
      icon: ShieldCheck,
      label: "No Review",
      value: stats.totalToday,
      tone: "success",
    },
    {
      title: "Approved Leave",
      description:
        "Approved leave automatically creates an EXCUSED attendance record when attendance generation runs.",
      icon: CalendarCheck,
      label: "EXCUSED",
      value: stats.excusedTotal,
      tone: "success",
    },
    {
      title: "Exception Calendar",
      description:
        "Active exception dates protect employees from incorrect ABSENT generation.",
      icon: CalendarDays,
      label: "Blocking Today",
      value: stats.todayBlockingExceptions,
      tone: "info",
    },
    {
      title: "ABSENT Rollback",
      description:
        "Only automatic ABSENT records without punch data are eligible for rollback.",
      icon: RotateCcw,
      label: "Eligible",
      value: stats.rollbackEligibleAbsent,
      tone: "danger",
    },
  ];

  const attendanceActionCards: AttendanceActionCard[] =
    [
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
          "Review automatic EXCUSED records from approved leave and manual EXCUSED corrections.",
        href: "/dashboard/attendance/excused",
        icon: CalendarCheck,
        badge: "EXCUSED",
        buttonLabel:
          "View EXCUSED Records",
        statLabel: "Total EXCUSED",
        statValue: stats.excusedTotal,
        tone: "success",
      },
      {
        title: "Exception Calendar",
        description:
          "Manage holidays, suspensions, no-work dates, rest days, and branch-specific exceptions.",
        href: "/dashboard/attendance/exceptions",
        icon: CalendarDays,
        badge: "Exceptions",
        buttonLabel: "Open Exceptions",
        statLabel: "Active",
        statValue:
          stats.activeAttendanceExceptions,
        tone: "info",
      },
      {
        title: "Exception Audit",
        description:
          "Review exception create, update, and archive logs with filters, print, and CSV export.",
        href: "/dashboard/attendance/exceptions/audit",
        icon: FileClock,
        badge: "Exception Logs",
        buttonLabel:
          "Open Exception Audit",
        statLabel: "Total Logs",
        statValue: stats.exceptionAuditLogs,
        tone: "info",
      },
      {
        title: "Schedule Assignment",
        description:
          "Bulk assign schedules by branch, department, designation, employee type, or current schedule.",
        href: "/dashboard/attendance/schedule-assignment",
        icon: CalendarClock,
        badge: "Schedules",
        buttonLabel:
          "Assign Schedules",
        statLabel: "Attendance Today",
        statValue: stats.totalToday,
        tone: "info",
      },
      {
        title: "Attendance Generation",
        description:
          "Preview scheduled employees and generate EXCUSED or ABSENT records safely.",
        href: "/dashboard/attendance/absences/candidates",
        icon: ClipboardCheck,
        badge: "Generate",
        buttonLabel:
          "Preview Generation",
        statLabel: "EXCUSED Today",
        statValue: stats.excusedToday,
        tone: "success",
      },
      {
        title: "ABSENT Records",
        description:
          "Review generated and manual ABSENT records with filters, print, CSV export, and detail links.",
        href: "/dashboard/attendance/absences",
        icon: TimerOff,
        badge: "ABSENT",
        buttonLabel:
          "View ABSENT Records",
        statLabel: "Total ABSENT",
        statValue: stats.absentTotal,
        tone: "danger",
      },
      {
        title: "Rollback ABSENT",
        description:
          "Rollback wrongly generated automatic ABSENT records while protecting manual and punched records.",
        href: "/dashboard/attendance/absences/rollback",
        icon: RotateCcw,
        badge: "Rollback",
        buttonLabel: "Open Rollback",
        statLabel: "Eligible",
        statValue:
          stats.rollbackEligibleAbsent,
        tone: "danger",
      },
      {
        title: "Status Recalculation",
        description:
          "Recalculate normal attendance status using assigned schedules and shift rules.",
        href: "/dashboard/attendance/status-recalculation",
        icon: RefreshCw,
        badge: "Auto Status",
        buttonLabel:
          "Open Recalculation",
        statLabel: "Attendance Today",
        statValue: stats.totalToday,
        tone: "info",
      },
      {
        title: "Manual Attendance Input",
        description:
          "Create or correct attendance manually. Manual changes are marked for HR review.",
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
          "Review manual attendance, edits, and corrections. Normal punches are excluded.",
        href: "/dashboard/attendance/review",
        icon: ClipboardCheck,
        badge: "HR Review",
        buttonLabel:
          "Open Review Queue",
        statLabel: "Open Review",
        statValue: stats.openReview,
        tone: "warning",
      },
      {
        title: "Missing Timeout Management",
        description:
          "Manage old normal records with time-in but without a recorded time-out.",
        href: "/dashboard/attendance/missing-timeouts",
        icon: ClockAlert,
        badge: "Timeout",
        buttonLabel:
          "Open Missing Timeouts",
        statLabel: "Missing Timeout",
        statValue: stats.missingTimeout,
        tone: "danger",
      },
      {
        title: "Attendance Automation",
        description:
          "Check cron setup and run missing-timeout and status-recalculation automation.",
        href: "/dashboard/attendance/automation",
        icon: Hourglass,
        badge: "Cron",
        buttonLabel:
          "Open Automation",
        statLabel: "Missing Timeout",
        statValue: stats.missingTimeout,
        tone: "info",
      },
      {
        title: "Attendance Audit Trail",
        description:
          "Track changes, approvals, recalculation, ABSENT generation, EXCUSED generation, and rollback.",
        href: "/dashboard/attendance/audit",
        icon: History,
        badge: "Attendance Audit",
        buttonLabel:
          "Open Audit Trail",
        statLabel: "Audit Logs",
        statValue:
          stats.attendanceAuditLogs,
        tone: "info",
      },
      {
        title: "Attendance Reports",
        description:
          "Generate filtered attendance reports with print and CSV export.",
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
          "Open the online distance learning employee time-in and time-out page.",
        href: "/dashboard/attendance/odl",
        icon: MonitorSmartphone,
        badge: "ODL",
        buttonLabel:
          "Open ODL Attendance",
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
            Manage attendance records,
            schedules, approved-leave EXCUSED
            records, exceptions, ABSENT records,
            reviews, automation, reports, and
            audit trails.
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
            Today, EXCUSED, ABSENT, and Review
            Status
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            These live counts show normal
            attendance, approved-leave EXCUSED
            records, ABSENT records, exceptions,
            reviews, and audit activity.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Today&apos;s Attendance
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.totalToday}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              On Time Today
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.onTimeToday}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Timer className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Late Today
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.lateToday}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              EXCUSED Today
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.excusedToday}
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total EXCUSED
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.excusedTotal}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Auto: {stats.automaticExcused} ·
              Manual: {stats.manualExcused}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              EXCUSED Generation Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                stats.generatedExcusedAuditLogs
              }
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Approved-leave automation
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Absent Today
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.absentToday}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total ABSENT
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.absentTotal}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Auto: {stats.automaticAbsent} ·
              Manual: {stats.manualAbsent}
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Active Exceptions
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                stats.activeAttendanceExceptions
              }
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Blocking ABSENT:{" "}
              {stats.absenceBlockingExceptions} ·
              Today:{" "}
              {stats.todayBlockingExceptions}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <RotateCcw className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Rollback Eligible
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                stats.rollbackEligibleAbsent
              }
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Rollback logs:{" "}
              {stats.absentRollbackAuditLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardCheck className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Open Review
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.openReview}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Attendance Audit Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.attendanceAuditLogs}
            </p>
          </article>
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Attendance Policy
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Approved Leave Creates EXCUSED
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Assign schedules, approve leave,
            encode attendance exceptions, preview
            attendance generation, and generate
            EXCUSED or ABSENT records only after
            verification.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          {policyCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
              >
                <Icon
                  className={[
                    "h-7 w-7",
                    iconToneClass(card.tone),
                  ].join(" ")}
                  aria-hidden="true"
                />

                <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
                  {card.title}
                </p>

                <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
                  {card.label}: {card.value}
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {attendanceActionCards.map(
          (card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.href}
                className="starland-card flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)]">
                      <Icon
                        className={[
                          "h-6 w-6",
                          iconToneClass(card.tone),
                        ].join(" ")}
                        aria-hidden="true"
                      />
                    </div>

                    <span
                      className={[
                        "starland-badge",
                        badgeToneClass(
                          card.tone,
                        ),
                      ].join(" ")}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-extrabold text-[var(--starland-dark-text)]">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
                    {card.description}
                  </p>

                  <div className="mt-4 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                      {card.statLabel}
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
                      {card.statValue}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    href={card.href}
                    className="starland-btn starland-btn-primary"
                  >
                    {card.buttonLabel}
                  </Link>
                </div>
              </article>
            );
          },
        )}
      </section>
    </section>
  );
}