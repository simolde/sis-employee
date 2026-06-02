import Link from "next/link";
import { ArrowLeft, ClipboardEdit } from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ManualAttendanceForm } from "@/features/attendance/manual/components/manual-attendance-form";
import { getManualAttendancePageData } from "@/features/attendance/manual/server/manual-attendance-queries";

export default async function ManualAttendancePage() {
  await requireCanManageEmployees();

  const data = await getManualAttendancePageData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-warning">
            Manual Attendance
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Manual Attendance Input
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Create or correct attendance records manually. Manual attendance is
            always marked as pending review and must be verified or approved
            before final reporting.
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

      <section className="starland-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
            <ClipboardEdit className="h-6 w-6" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Review Required by Policy
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
              Normal RFID, biometric/kiosk, and ODL attendance do not need HR
              review. This page is only for manual input, manual edits, and
              corrections, so every saved record will require review.
            </p>
          </div>
        </div>
      </section>

      <ManualAttendanceForm employees={data.employees} />
    </section>
  );
}