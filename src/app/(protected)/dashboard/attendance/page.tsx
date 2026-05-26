import { redirect } from "next/navigation";
import { AttendanceDetailsModal } from "@/features/attendance/components/attendance-details-modal";
import { AttendanceListFilters } from "@/features/attendance/components/attendance-list-filters";
import { AttendancePagination } from "@/features/attendance/components/attendance-pagination";
import { AttendanceSummaryCards } from "@/features/attendance/components/attendance-summary-cards";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { MyAttendanceTable } from "@/features/attendance/components/my-attendance-table";
import { TimeInOutForm } from "@/features/attendance/components/time-in-out-form";
import { getCurrentSession } from "@/features/auth/server/session";
import { canViewAllAttendance } from "@/lib/security/roles";
import { getOdlAttendancePageData } from "@/features/attendance/server/attendance-form-queries";
import {
  getAttendanceDetail,
  getAttendanceList,
} from "@/features/attendance/server/attendance-queries";
import { getMyAttendanceList } from "@/features/attendance/server/my-attendance-queries";
import { parseAttendanceListSearchParams } from "@/features/attendance/validators/attendance-list-validation";

type AttendancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePositivePage(value: string | string[] | undefined): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 1;
  }

  return parsed;
}

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const filters = parseAttendanceListSearchParams(resolvedSearchParams);
  const canViewAllRecords = canViewAllAttendance(session.role);

  const [odlAttendancePageData, detail] = await Promise.all([
    getOdlAttendancePageData(),
    filters.detailId ? getAttendanceDetail(filters.detailId) : null,
  ]);

  if (!canViewAllRecords) {
    const myAttendance = await getMyAttendanceList({
      page: parsePositivePage(resolvedSearchParams.page),
      pageSize: 10,
    });

    return (
      <section className="starland-page space-y-5">
        <div>
          <span className="starland-badge starland-badge-success">
            ODL Attendance
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            My Attendance
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            ODL teachers use web attendance with automatic location and selfie.
            Face-to-face teachers use the lobby RFID/biometric system.
          </p>
        </div>

        <TimeInOutForm pageData={odlAttendancePageData} />

        <MyAttendanceTable result={myAttendance} />

        <AttendanceDetailsModal detail={detail} />
      </section>
    );
  }

  const result = await getAttendanceList(filters);

  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          Attendance Management
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Attendance
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          HR/Admin can view all records. ODL teachers can use web attendance.
          Face-to-face teachers use the lobby RFID/biometric system.
        </p>
      </div>

      <TimeInOutForm pageData={odlAttendancePageData} />

      <AttendanceSummaryCards summary={result.summary} />

      <AttendanceListFilters filters={result.filters} />

      <AttendanceTable records={result.records} filters={result.filters} />

      <AttendancePagination result={result} />

      <AttendanceDetailsModal detail={detail} />
    </section>
  );
}