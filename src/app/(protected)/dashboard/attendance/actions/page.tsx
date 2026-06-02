import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  ClipboardCheck,
  ClipboardEdit,
  Clock3,
  FileSpreadsheet,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";

type AttendanceActionCard = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  badge: string;
  buttonLabel: string;
};

const attendanceActionCards: AttendanceActionCard[] = [
  {
    title: "Attendance List",
    description:
      "View all RFID, biometric/kiosk, ODL, and manual attendance records.",
    href: "/dashboard/attendance",
    icon: Clock3,
    badge: "Records",
    buttonLabel: "Open Attendance",
  },
  {
    title: "Manual Attendance Input",
    description:
      "Create or correct attendance manually. These records are automatically marked as pending review.",
    href: "/dashboard/attendance/manual",
    icon: ClipboardEdit,
    badge: "Manual",
    buttonLabel: "Manual Input",
  },
  {
    title: "Attendance Review Queue",
    description:
      "Review only manual attendance, manual edits, and corrections. Normal punches are excluded.",
    href: "/dashboard/attendance/review",
    icon: ClipboardCheck,
    badge: "HR Review",
    buttonLabel: "Open Review Queue",
  },
  {
    title: "Attendance Reports",
    description:
      "Generate filtered attendance reports with print and CSV export.",
    href: "/dashboard/attendance/reports",
    icon: FileSpreadsheet,
    badge: "Reports",
    buttonLabel: "Open Reports",
  },
  {
    title: "ODL Time In / Out",
    description:
      "Open the online distance learning teacher time-in and time-out page.",
    href: "/dashboard/attendance/odl",
    icon: MonitorSmartphone,
    badge: "ODL",
    buttonLabel: "Open ODL Attendance",
  },
];

export default async function AttendanceActionsPage() {
  await requireCanManageEmployees();

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
            Manage attendance records, manual corrections, HR review, and
            reports from one place.
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
            Review Policy
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Normal Punches vs Manual Corrections
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            RFID, biometric/kiosk, and ODL attendance are treated as normal
            punches. Manual input, manual edits, and corrections are marked as
            pending review and must be checked by HR/Admin.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Normal Attendance
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              No Review Needed
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              RFID, biometric/kiosk, and ODL time-in/out records proceed without
              HR review unless manually changed later.
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardCheck className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual Changes
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              Review Required
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Manual input, edits, and corrections are saved as pending review
              until verified or approved.
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 md:col-span-2 xl:col-span-1">
            <BarChart3 className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Reporting
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              Export and Print
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Attendance reports and review queues can be printed or exported
              to CSV.
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                    <Icon className="h-6 w-6" aria-hidden />
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
              </div>

              <div className="mt-5">
                <Link href={card.href} className="starland-btn starland-btn-primary">
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