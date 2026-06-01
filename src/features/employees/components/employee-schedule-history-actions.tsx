"use client";

import { Download, Printer } from "lucide-react";
import type { EmployeeScheduleHistoryData } from "../types/employee-schedule-history-types";
import {
  buildEmployeeScheduleHistoryCsv,
  buildEmployeeScheduleHistoryFileName,
} from "../utils/employee-schedule-history-csv";

type EmployeeScheduleHistoryActionsProps = {
  data: EmployeeScheduleHistoryData;
};

export function EmployeeScheduleHistoryActions({
  data,
}: EmployeeScheduleHistoryActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    const csv = buildEmployeeScheduleHistoryCsv(data);
    const fileName = buildEmployeeScheduleHistoryFileName(data);
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
  );
}