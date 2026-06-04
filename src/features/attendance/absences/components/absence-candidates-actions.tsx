"use client";

import { Download, Printer } from "lucide-react";
import type { AbsenceCandidateResult } from "../types/absence-candidate-types";
import {
  buildAbsenceCandidatesCsv,
  buildAbsenceCandidatesFileName,
} from "../utils/absence-candidates-csv";

type AbsenceCandidatesActionsProps = {
  result: AbsenceCandidateResult;
};

export function AbsenceCandidatesActions({
  result,
}: AbsenceCandidatesActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    const csv = buildAbsenceCandidatesCsv(result);
    const fileName = buildAbsenceCandidatesFileName(result);
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
        Print Preview
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