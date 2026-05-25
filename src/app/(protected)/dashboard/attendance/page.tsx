import { AttendanceDetailsModal } from "@/features/attendance/components/attendance-details-modal";
import { AttendanceListFilters } from "@/features/attendance/components/attendance-list-filters";
import { AttendancePagination } from "@/features/attendance/components/attendance-pagination";
import { AttendanceSummaryCards } from "@/features/attendance/components/attendance-summary-cards";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
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

  const [result, detail] = await Promise.all([
    getAttendanceList(filters),
    filters.detailId ? getAttendanceDetail(filters.detailId) : null,
  ]);

  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          Attendance Records
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Attendance
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          View employee time-in/time-out records, schedule status, source,
          branch, GPS details, photos, manual flags, sync status, and logs.
        </p>
      </div>

      <AttendanceSummaryCards summary={result.summary} />

      <AttendanceListFilters filters={result.filters} />

      <AttendanceTable records={result.records} filters={result.filters} />

      <AttendancePagination result={result} />

      <AttendanceDetailsModal detail={detail} />
    </section>
  );
}