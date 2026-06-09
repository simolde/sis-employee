"use client";

import {
  Download,
  Printer,
} from "lucide-react";
import type { AttendanceAutomationCronReceiptReportData } from "../types/attendance-automation-cron-receipt-report-types";
import {
  buildAttendanceAutomationCronReceiptReportCsv,
  buildAttendanceAutomationCronReceiptReportFileName,
} from "../utils/attendance-automation-cron-receipt-report-csv";

type AttendanceAutomationCronReceiptReportActionsProps = {
  data:
    AttendanceAutomationCronReceiptReportData;
};

export function AttendanceAutomationCronReceiptReportActions({
  data,
}: AttendanceAutomationCronReceiptReportActionsProps) {
  function handlePrint(): void {
    window.print();
  }

  function handleExportCsv(): void {
    const csv =
      buildAttendanceAutomationCronReceiptReportCsv(
        data,
      );

    const fileName =
      buildAttendanceAutomationCronReceiptReportFileName(
        data,
      );

    const blob =
      new Blob(
        [
          `\uFEFF${csv}`,
        ],
        {
          type:
            "text/csv;charset=utf-8",
        },
      );

    const objectUrl =
      URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href = objectUrl;
    link.download = fileName;

    document.body.appendChild(
      link,
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
      objectUrl,
    );
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