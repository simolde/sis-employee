"use client";

import {
  Download,
  Printer,
} from "lucide-react";
import type { AttendanceAutomationAlertIncidentData } from "../types/attendance-automation-alert-incident-types";
import {
  buildAttendanceAutomationAlertIncidentCsv,
  buildAttendanceAutomationAlertIncidentCsvFileName,
} from "../utils/attendance-automation-alert-incident-csv";

type AttendanceAutomationAlertIncidentActionsProps = {
  data:
    AttendanceAutomationAlertIncidentData;
};

export function AttendanceAutomationAlertIncidentActions({
  data,
}: AttendanceAutomationAlertIncidentActionsProps) {
  function handlePrint(): void {
    window.print();
  }

  function handleExportCsv(): void {
    const csv =
      buildAttendanceAutomationAlertIncidentCsv(
        data,
      );

    const fileName =
      buildAttendanceAutomationAlertIncidentCsvFileName(
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

    link.href =
      objectUrl;

    link.download =
      fileName;

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

        Print Timeline
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