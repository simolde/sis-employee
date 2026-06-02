"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Printer } from "lucide-react";

type AttendanceAuditDetailActionsProps = {
  oldValue: string;
  newValue: string;
};

type CopyTarget = "old" | "new" | "both" | null;

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function AttendanceAuditDetailActions({
  oldValue,
  newValue,
}: AttendanceAuditDetailActionsProps) {
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget>(null);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleCopy(target: Exclude<CopyTarget, null>, value: string) {
    const copied = await copyText(value);

    setCopyFailed(!copied);

    if (copied) {
      setCopiedTarget(target);

      window.setTimeout(() => {
        setCopiedTarget(null);
      }, 1800);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-col gap-2 print:hidden sm:flex-row sm:flex-wrap">
      <button
        type="button"
        className="starland-btn starland-btn-secondary"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Print Detail
      </button>

      <button
        type="button"
        className="starland-btn starland-btn-soft"
        onClick={() => void handleCopy("old", oldValue)}
      >
        {copiedTarget === "old" ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copiedTarget === "old" ? "Old JSON Copied" : "Copy Old JSON"}
      </button>

      <button
        type="button"
        className="starland-btn starland-btn-soft"
        onClick={() => void handleCopy("new", newValue)}
      >
        {copiedTarget === "new" ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copiedTarget === "new" ? "New JSON Copied" : "Copy New JSON"}
      </button>

      <button
        type="button"
        className="starland-btn starland-btn-primary"
        onClick={() =>
          void handleCopy(
            "both",
            `OLD VALUE\n${oldValue}\n\nNEW VALUE\n${newValue}`,
          )
        }
      >
        {copiedTarget === "both" ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copiedTarget === "both" ? "Both JSON Copied" : "Copy Both"}
      </button>

      {copyFailed ? (
        <p className="text-xs font-semibold text-[var(--starland-danger)] sm:basis-full">
          Copy failed. Your browser may require HTTPS or clipboard permission.
        </p>
      ) : null}
    </div>
  );
}