"use client";

import { Download, Printer } from "lucide-react";
import type { AttendanceExceptionResult } from "../types/attendance-exception-types";
import {
  buildAttendanceExceptionsCsv,
  buildAttendanceExceptionsFileName,
} from "../utils/attendance-exceptions-csv";

type AttendanceExceptionActionsProps = {
  result: AttendanceExceptionResult;
};

export function AttendanceExceptionActions({
  result,
}: AttendanceExceptionActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    const csv = buildAttendanceExceptionsCsv(result);
    const fileName = buildAttendanceExceptionsFileName(result);
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
        Print Exceptions
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