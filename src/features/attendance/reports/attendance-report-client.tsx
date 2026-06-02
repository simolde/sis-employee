"use client";

import { Download, Printer } from "lucide-react";
import type {
  AttendanceReportData,
  AttendanceReportRow,
} from "./attendance-report-types";

type AttendanceReportClientProps = {
  data: AttendanceReportData;
};

function escapeCsvValue(value: string | number | boolean): string {
  const text = String(value);
  const escaped = text.replaceAll('"', '""');

  return `"${escaped}"`;
}

function safeFilePart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function buildCsvRows(data: AttendanceReportData): string {
  const headers = [
    "Attendance ID",
    "Date",
    "Employee Number",
    "Employee Name",
    "Branch",
    "Department",
    "Schedule",
    "Shift",
    "Shift Time",
    "Time In",
    "Time Out",
    "Source",
    "Status",
    "Total Hours",
    "Time-In Address",
    "Time-Out Address",
    "Verified By",
    "Approved By",
  ];

  const rows = data.rows.map((row) => [
    row.attendanceId,
    row.attDate,
    row.empNumber,
    row.employeeName,
    row.branchName,
    row.departmentName,
    row.scheduleName,
    row.shiftName,
    row.shiftTime,
    row.timeIn,
    row.timeOut,
    row.source,
    row.status,
    row.totalHours,
    row.inAddress,
    row.outAddress,
    row.verifiedBy,
    row.approvedBy,
  ]);

  const summaryRows = [
    ["Attendance Report"],
    ["Date From", data.filters.dateFrom],
    ["Date To", data.filters.dateTo],
    ["Status", data.filters.status],
    ["Source", data.filters.source],
    ["Search", data.filters.q || "—"],
    ["Total Records", data.summary.totalRecords],
    ["ON TIME", data.summary.onTime],
    ["LATE", data.summary.late],
    ["HALF DAY", data.summary.halfDay],
    ["ABSENT", data.summary.absent],
    ["EXCUSED", data.summary.excused],
    ["PENDING REVIEW", data.summary.pendingReview],
    ["MISSING TIMEOUT", data.summary.missingTimeout],
    ["Total Hours", data.summary.totalHours],
    [],
  ];

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

function buildFileName(data: AttendanceReportData): string {
  const datePart = safeFilePart(`${data.filters.dateFrom}-${data.filters.dateTo}`);
  const statusPart = safeFilePart(data.filters.status);

  return `attendance-report-${datePart}-${statusPart || "all"}.csv`;
}

function statusBadgeClass(status: string): string {
  if (status === "ON_TIME") {
    return "starland-badge-success";
  }

  if (status === "LATE" || status === "HALF_DAY") {
    return "starland-badge-warning";
  }

  if (status === "ABSENT" || status === "MISSING_TIMEOUT") {
    return "starland-badge-danger";
  }

  return "starland-badge-info";
}

function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

function AttendanceReportRowView({ row }: { row: AttendanceReportRow }) {
  return (
    <tr>
      <td>
        <p className="font-bold text-[var(--starland-dark-text)]">
          {row.employeeName}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
          {row.empNumber}
        </p>
      </td>

      <td>
        <p>{row.branchName}</p>
        <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
          {row.departmentName}
        </p>
      </td>

      <td>
        <p>{row.scheduleName}</p>
        <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
          {row.shiftName} · {row.shiftTime}
        </p>
      </td>

      <td>{row.attDate}</td>
      <td>{row.timeIn}</td>
      <td>{row.timeOut}</td>
      <td>{row.source}</td>

      <td>
        <span className={["starland-badge", statusBadgeClass(row.status)].join(" ")}>
          {formatStatusLabel(row.status)}
        </span>
      </td>

      <td>{row.totalHours}</td>
      <td>{row.verifiedBy}</td>
      <td>{row.approvedBy}</td>
    </tr>
  );
}

export function AttendanceReportClient({ data }: AttendanceReportClientProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    const csv = buildCsvRows(data);
    const fileName = buildFileName(data);
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          className="starland-btn starland-btn-secondary"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print Report
        </button>

        <button
          type="button"
          className="starland-btn starland-btn-primary"
          onClick={handleExportCsv}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Attendance Report Results
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Showing up to 1,000 attendance records based on the selected
            filters.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Branch / Department</th>
                <th>Schedule / Shift</th>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Source</th>
                <th>Status</th>
                <th>Total</th>
                <th>Verified By</th>
                <th>Approved By</th>
              </tr>
            </thead>

            <tbody>
              {data.rows.length > 0 ? (
                data.rows.map((row) => (
                  <AttendanceReportRowView
                    key={row.attendanceId}
                    row={row}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={11}>
                    <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        No attendance records found
                      </p>

                      <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                        Change the filters above and try again.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}