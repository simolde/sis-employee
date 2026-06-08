"use client";

import {
  Download,
  Printer,
} from "lucide-react";
import type { AttendanceAutomationFilteredAlertResult } from "../types/attendance-automation-alert-filter-types";
import {
  buildAttendanceAutomationAlertCsv,
  buildAttendanceAutomationAlertCsvFileName,
} from "../utils/attendance-automation-alert-csv";

type AttendanceAutomationAlertActionsProps = {
  result: AttendanceAutomationFilteredAlertResult;
};

export function AttendanceAutomationAlertActions({
  result,
}: AttendanceAutomationAlertActionsProps) {
  function handlePrint(): void {
    window.print();
  }

  function handleExportCsv(): void {
    const csv =
      buildAttendanceAutomationAlertCsv(
        result,
      );

    const fileName =
      buildAttendanceAutomationAlertCsvFileName(
        result,
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

        Print
      </button>

      <button
        type="button"
        className="starland-btn starland-btn-primary"
        onClick={handleExportCsv}
        disabled={
          result.alerts.length === 0
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