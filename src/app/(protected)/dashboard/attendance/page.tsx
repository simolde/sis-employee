import { AttendanceDetailsModal } from "@/features/attendance/components/attendance-details-modal";
import { AttendanceListFilters } from "@/features/attendance/components/attendance-list-filters";
import { AttendancePagination } from "@/features/attendance/components/attendance-pagination";
import { AttendanceSummaryCards } from "@/features/attendance/components/attendance-summary-cards";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { TimeInOutForm } from "@/features/attendance/components/time-in-out-form";
import { getAttendanceFormOptions } from "@/features/attendance/server/attendance-form-queries";
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

  const [result, detail, formOptions] = await Promise.all([
    getAttendanceList(filters),
    filters.detailId ? getAttendanceDetail(filters.detailId) : null,
    getAttendanceFormOptions(),
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
          View records and record manual web time-in/time-out with GPS, address,
          branch, photo path, reason, and attendance logs.
        </p>
      </div>

      <TimeInOutForm options={formOptions} />

      <AttendanceSummaryCards summary={result.summary} />

      <AttendanceListFilters filters={result.filters} />

      <AttendanceTable records={result.records} filters={result.filters} />

      <AttendancePagination result={result} />

      <AttendanceDetailsModal detail={detail} />
    </section>
  );
}