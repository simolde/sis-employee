import Link from "next/link";
import { redirect } from "next/navigation";
import { History } from "lucide-react";
import { AttendanceDetailsModal } from "@/features/attendance/components/attendance-details-modal";
import { MyAttendanceTable } from "@/features/attendance/components/my-attendance-table";
import { TimeInOutForm } from "@/features/attendance/components/time-in-out-form";
import { getCurrentSession } from "@/features/auth/server/session";
import { getOdlAttendancePageData } from "@/features/attendance/server/attendance-form-queries";
import {
  getMyAttendanceDetail,
  getMyAttendanceList,
} from "@/features/attendance/server/my-attendance-queries";

type OdlAttendancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parsePositivePage(value: string | string[] | undefined): number {
  const rawValue = getSearchParamValue(value);
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 1;
  }

  return parsed;
}

export default async function OdlAttendancePage({
  searchParams,
}: OdlAttendancePageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const detailId = getSearchParamValue(resolvedSearchParams.detailId) ?? "";

  const [odlAttendancePageData, myAttendance, detail] = await Promise.all([
    getOdlAttendancePageData(),
    getMyAttendanceList({
      page: parsePositivePage(resolvedSearchParams.page),
      pageSize: 10,
    }),
    detailId ? getMyAttendanceDetail(detailId) : null,
  ]);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            ODL Web Attendance
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            My ODL Attendance
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            This page is for Online Distance Learning teachers only. The system
            automatically checks today&apos;s record, captures location on page
            load, requires a uniform selfie, then decides whether your next
            submit is TIME IN or TIME OUT.
          </p>
        </div>

        <Link
          href="/dashboard/attendance/odl/history"
          className="starland-btn starland-btn-primary"
        >
          <History className="h-4 w-4" aria-hidden="true" />
          View ODL History
        </Link>
      </div>

      <TimeInOutForm pageData={odlAttendancePageData} />

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Recent Attendance
            </h2>

            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              Quick view of your latest attendance records. Open the full
              history page for date filtering.
            </p>
          </div>

          <Link
            href="/dashboard/attendance/odl/history"
            className="starland-btn starland-btn-soft"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            Full History
          </Link>
        </div>

        <MyAttendanceTable result={myAttendance} />
      </section>

      <AttendanceDetailsModal
        detail={detail}
        closeHref="/dashboard/attendance/odl"
      />
    </section>
  );
}