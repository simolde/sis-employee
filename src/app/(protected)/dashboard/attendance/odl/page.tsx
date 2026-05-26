import { redirect } from "next/navigation";
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
          load, requires a uniform selfie, then decides whether your next submit
          is TIME IN or TIME OUT.
        </p>
      </div>

      <TimeInOutForm pageData={odlAttendancePageData} />

      <MyAttendanceTable result={myAttendance} />

      <AttendanceDetailsModal
        detail={detail}
        closeHref="/dashboard/attendance/odl"
      />
    </section>
  );
}