"use client";

import {
  Download,
  Printer,
} from "lucide-react";
import type { AttendanceAutomationReportData } from "../types/attendance-automation-report-types";
import {
  buildAttendanceAutomationReportCsv,
  buildAttendanceAutomationReportFileName,
} from "../utils/attendance-automation-report-csv";

type AttendanceAutomationReportActionsProps = {
  data: AttendanceAutomationReportData;
};

export function AttendanceAutomationReportActions({
  data,
}: AttendanceAutomationReportActionsProps) {
  function handlePrint(): void {
    window.print();
  }

  function handleExportCsv(): void {
    const csv =
      buildAttendanceAutomationReportCsv(
        data,
      );

    const fileName =
      buildAttendanceAutomationReportFileName(
        data,
      );

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });

    const objectUrl =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        className="starland-btn starland-btn-soft"
        onClick={handlePrint}
      >
        <Printer
          className="h-4 w-4"
          aria-hidden="true"
        />

        Print Report
      </button>

      <button
        type="button"
        className="starland-btn starland-btn-primary"
        onClick={handleExportCsv}
        disabled={
          data.summary.totalRuns === 0
        }
      >
        <Download
          className="h-4 w-4"
          aria-hidden="true"
        />

        Export CSV
      </button>
    </div>
  );
}