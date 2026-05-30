"use client";

import { Download, Printer } from "lucide-react";
import type { NoticeReadReportData } from "../types/notice-types";
import {
  buildNoticeReadReportCsv,
  buildNoticeReadReportFileName,
} from "../utils/notice-read-report-csv";

type NoticeReadReportActionsProps = {
  data: NoticeReadReportData;
};

export function NoticeReadReportActions({
  data,
}: NoticeReadReportActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    const csv = buildNoticeReadReportCsv(data);
    const fileName = buildNoticeReadReportFileName(data);
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