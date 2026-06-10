import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  ClipboardEdit,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ManualAttendanceForm } from "@/features/attendance/manual/components/manual-attendance-form";
import { getManualAttendancePageData } from "@/features/attendance/manual/server/manual-attendance-queries";
import {
  getAttendanceEnforcementPolicy,
  getAttendanceSourceDisabledMessage,
  isAttendanceSourceAllowed,
} from "@/features/attendance/policies/server/attendance-policy-enforcement";

export default async function ManualAttendancePage() {
  await requireCanManageEmployees();

  const policy =
    await getAttendanceEnforcementPolicy();

  const manualAttendanceAllowed =
    isAttendanceSourceAllowed({
      source: "MANUAL",
      policy,
    });

  const data =
    manualAttendanceAllowed
      ? await getManualAttendancePageData()
      : null;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span
            className={[
              "starland-badge",
              manualAttendanceAllowed
                ? "starland-badge-warning"
                : "starland-badge-danger",
            ].join(" ")}
          >
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
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Back to Attendance
        </Link>
      </div>

      {manualAttendanceAllowed ? (
        <>
          <section className="starland-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
                <ClipboardEdit
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                  Review Required by Policy
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
                  Normal RFID, biometric/kiosk, and ODL attendance do not need
                  HR review. This page is only for manual input, manual edits,
                  and corrections, so every saved record will require review.
                </p>
              </div>
            </div>
          </section>

          <ManualAttendanceForm
            employees={
              data?.employees ?? []
            }
          />
        </>
      ) : (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <Ban
              className="mt-0.5 h-6 w-6 shrink-0 text-red-700"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-red-900">
                Manual Attendance Disabled
              </h2>

              <p className="mt-1 text-sm font-semibold leading-6 text-red-800">
                {getAttendanceSourceDisabledMessage(
                  "MANUAL",
                )}
              </p>

              <p className="mt-2 text-sm leading-6 text-red-700">
                An authorized administrator can enable it under Settings →
                Attendance Policies.
              </p>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}