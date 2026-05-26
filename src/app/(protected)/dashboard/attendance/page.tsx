import { AttendanceDetailsModal } from "@/features/attendance/components/attendance-details-modal";
import { AttendanceListFilters } from "@/features/attendance/components/attendance-list-filters";
import { AttendancePagination } from "@/features/attendance/components/attendance-pagination";
import { AttendanceSummaryCards } from "@/features/attendance/components/attendance-summary-cards";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { TimeInOutForm } from "@/features/attendance/components/time-in-out-form";
import { getOdlAttendancePageData } from "@/features/attendance/server/attendance-form-queries";
import {
  getAttendanceDetail,
  getAttendanceList,
} from "@/features/attendance/server/attendance-queries";
import { parseAttendanceListSearchParams } from "@/features/attendance/validators/attendance-list-validation";

type AttendancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseAttendanceListSearchParams(resolvedSearchParams);

  const [result, detail, odlAttendancePageData] = await Promise.all([
    getAttendanceList(filters),
    filters.detailId ? getAttendanceDetail(filters.detailId) : null,
    getOdlAttendancePageData(),
  ]);

  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          ODL Attendance
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Attendance
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          ODL teachers use web attendance with automatic location and selfie.
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