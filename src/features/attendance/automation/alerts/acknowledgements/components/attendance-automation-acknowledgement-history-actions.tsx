"use client";

import {
  Download,
  Printer,
} from "lucide-react";
import type { AttendanceAutomationAcknowledgementHistoryData } from "../types/attendance-automation-alert-acknowledgement-history-types";
import {
  buildAttendanceAutomationAcknowledgementHistoryCsv,
  buildAttendanceAutomationAcknowledgementHistoryFileName,
} from "../utils/attendance-automation-acknowledgement-history-csv";

type AttendanceAutomationAcknowledgementHistoryActionsProps = {
  data: AttendanceAutomationAcknowledgementHistoryData;
};

export function AttendanceAutomationAcknowledgementHistoryActions({
  data,
}: AttendanceAutomationAcknowledgementHistoryActionsProps) {
  function handlePrint(): void {
    window.print();
  }

  function handleExportCsv(): void {
    const csv =
      buildAttendanceAutomationAcknowledgementHistoryCsv(
        data,
      );

    const fileName =
      buildAttendanceAutomationAcknowledgementHistoryFileName(
        data,
      );

    /*
     * The UTF-8 BOM improves compatibility when
     * opening the exported CSV in Microsoft Excel.
     */
    const csvWithBom = `\uFEFF${csv}`;

    const blob = new Blob(
      [csvWithBom],
      {
        type: "text/csv;charset=utf-8",
      },
    );

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

        Print History
      </button>

      <button
        type="button"
        className="starland-btn starland-btn-primary"
        onClick={handleExportCsv}
        disabled={
          data.records.length === 0
        }
      >
        <Download
          className="h-4 w-4"
          aria-hidden="true"
        />

        Export Current Page
      </button>
    </div>
  );
}