"use client";

import {
  Download,
  Printer,
} from "lucide-react";
import type { ApprovedLeaveAutomationHistoryResult } from "../types/approved-leave-automation-history-types";
import {
  buildApprovedLeaveAutomationHistoryCsv,
  buildApprovedLeaveAutomationHistoryFileName,
} from "../utils/approved-leave-automation-history-csv";

type ApprovedLeaveAutomationHistoryActionsProps = {
  result: ApprovedLeaveAutomationHistoryResult;
};

export function ApprovedLeaveAutomationHistoryActions({
  result,
}: ApprovedLeaveAutomationHistoryActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    const csv =
      buildApprovedLeaveAutomationHistoryCsv(
        result,
      );

    const fileName =
      buildApprovedLeaveAutomationHistoryFileName(
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
        Print History
      </button>

      <button
        type="button"
        className="starland-btn starland-btn-primary"
        onClick={handleExportCsv}
        disabled={result.records.length === 0}
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