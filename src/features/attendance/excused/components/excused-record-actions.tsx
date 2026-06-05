"use client";

import {
  Download,
  Printer,
} from "lucide-react";
import type { ExcusedRecordResult } from "../types/excused-record-types";
import {
  buildExcusedRecordsCsv,
  buildExcusedRecordsFileName,
} from "../utils/excused-records-csv";

type ExcusedRecordActionsProps = {
  result: ExcusedRecordResult;
};

export function ExcusedRecordActions({
  result,
}: ExcusedRecordActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    const csv =
      buildExcusedRecordsCsv(result);

    const fileName =
      buildExcusedRecordsFileName(result);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });

    const objectUrl =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

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
        <Printer
          className="h-4 w-4"
          aria-hidden="true"
        />
        Print EXCUSED
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