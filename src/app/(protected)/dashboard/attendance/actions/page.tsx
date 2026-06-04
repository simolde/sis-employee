import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  ClipboardEdit,
  Clock3,
  ClockAlert,
  FileSpreadsheet,
  History,
  Hourglass,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Timer,
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
};

type AttendancePolicyCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: "success" | "warning" | "info" | "danger";
};

function iconToneClass(tone: AttendancePolicyCard["tone"]): string {
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

export default async function AttendanceActionsPage() {
  await requireCanManageEmployees();

  const stats = await getAttendanceActionHubStats();

  const policyCards: AttendancePolicyCard[] = [
    {
      title: "Normal Attendance",
      description:
        "RFID, biometric/kiosk, and ODL time-in/out records proceed without HR review unless manually changed later.",
      icon: ShieldCheck,
      label: "No Review Needed",
      value: stats.totalToday,
      tone: "success",
    },
    {
      title: "Schedule Assignment",
      description:
        "Bulk employee schedule assignment prevents HR from editing employee schedules one by one.",
      icon: CalendarClock,
      label: "Required For",
      value: "Auto Status",
      tone: "info",
    },
    {
      title: "Status Calculation",
      description:
        "Normal punches are automatically recalculated from assigned schedule, shift start time, and grace minutes.",
      icon: RefreshCw,
      label: "Today",
      value: stats.totalToday,
      tone: "info",
    },
    {
      title: "Manual Changes",
      description:
        "Manual input, edits, and corrections are saved as pending review until verified or approved.",
      icon: ClipboardCheck,
      label: "Open Review",
      value: stats.openReview,
      tone: "warning",
    },
  ];

  const attendanceActionCards: AttendanceActionCard[] = [
    {
      title: "Attendance List",
      description:
        "View all RFID, biometric/kiosk, ODL, and manual attendance records.",
      href: "/dashboard/attendance",
      icon: Clock3,
      badge: "Records",
      buttonLabel: "Open Attendance",
      statLabel: "Today",
      statValue: stats.totalToday,
    },
    {
      title: "Schedule Assignment",
      description:
        "Bulk assign employee schedules by branch, department, designation, employee type, or current schedule.",
      href: "/dashboard/attendance/schedule-assignment",
      icon: CalendarClock,
      badge: "Schedules",
      buttonLabel: "Assign Schedules",
      statLabel: "For Auto Status",
      statValue: stats.totalToday,
    },
    {
      title: "Status Recalculation",
      description:
        "Automatically recalculate normal attendance statuses using employee schedule and shift rules.",
      href: "/dashboard/attendance/status-recalculation",
      icon: RefreshCw,
      badge: "Auto Status",
      buttonLabel: "Open Recalculation",
      statLabel: "Today",
      statValue: stats.totalToday,
    },
    {
      title: "Manual Attendance Input",
      description:
        "Create or correct attendance manually. These records are automatically marked as pending review.",
      href: "/dashboard/attendance/manual",
      icon: ClipboardEdit,
      badge: "Manual",
      buttonLabel: "Manual Input",
      statLabel: "Manual Today",
      statValue: stats.manualToday,
    },
    {
      title: "Attendance Review Queue",
      description:
        "Review only manual attendance, manual edits, and corrections. Normal punches are excluded.",
      href: "/dashboard/attendance/review",
      icon: ClipboardCheck,
      badge: "HR Review",
      buttonLabel: "Open Review Queue",
      statLabel: "Open Review",
      statValue: stats.openReview,
    },
    {
      title: "Missing Timeout Management",
      description:
        "Mark old normal records with time-in but no time-out as missing timeout.",
      href: "/dashboard/attendance/missing-timeouts",
      icon: ClockAlert,
      badge: "Timeout",
      buttonLabel: "Open Missing Timeouts",
      statLabel: "Missing Timeout",
      statValue: stats.missingTimeout,
    },
    {
      title: "Attendance Automation",
      description:
        "Check cron setup, actor account, secret configuration, missing-timeout automation, and status recalculation automation.",
      href: "/dashboard/attendance/automation",
      icon: Hourglass,
      badge: "Cron",
      buttonLabel: "Open Automation",
      statLabel: "Missing Timeout",
      statValue: stats.missingTimeout,
    },
    {
      title: "Attendance Audit Trail",
      description:
        "Track manual changes, approvals, status updates, recalculation, and missing-timeout automation logs.",
      href: "/dashboard/attendance/audit",
      icon: History,
      badge: "Audit",
      buttonLabel: "Open Audit Trail",
      statLabel: "Audit Logs",
      statValue: stats.attendanceAuditLogs,
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
    },
    {
      title: "ODL Time In / Out",
      description:
        "Open the online distance learning teacher time-in and time-out page.",
      href: "/dashboard/attendance/odl",
      icon: MonitorSmartphone,
      badge: "ODL",
      buttonLabel: "Open ODL Attendance",
      statLabel: "WEB Today",
      statValue: stats.webToday,
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
            Manage attendance records, employee schedule assignment, manual
            corrections, missing timeouts, HR review, automation, audit trail,
            status recalculation, and reports from one place.
          </p>
        </div>

        <Link
          href="/dashboard/attendance"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Attendance
        </Link>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Live Attendance Snapshot
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Today and Review Status
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Use these live counts to quickly check today&apos;s attendance,
            missing timeouts, manual corrections, HR review workload, and audit
            logs.
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
            <ClockAlert className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Missing Timeout
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.missingTimeout}
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardEdit className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual Today
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.manualToday}
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
            <ShieldCheck className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Verified, Not Approved
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {stats.verifiedNotApproved}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Audit Logs
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
            Automation Policy
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Schedule First, Then Auto Status
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Make sure employees have the correct schedule assigned. Then the
            system can automatically calculate ON_TIME, LATE, HALF_DAY, and
            MISSING_TIMEOUT from the linked shift rules.
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
                  className={["h-7 w-7", iconToneClass(card.tone)].join(" ")}
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
        {attendanceActionCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.href}
              className="starland-card flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>

                  <span className="starland-badge starland-badge-success">
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
        })}
      </section>
    </section>
  );
}