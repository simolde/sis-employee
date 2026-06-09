"use client";

import {
  Check,
  ClipboardCopy,
} from "lucide-react";
import {
  useState,
} from "react";

type OrganizationTableSchemaCopyButtonProps = {
  report: string;

  entityLabel: string;
};

export function OrganizationTableSchemaCopyButton({
  report,
  entityLabel,
}: OrganizationTableSchemaCopyButtonProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(
        report,
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        2500,
      );
    } catch (error) {
      console.error(
        `Unable to copy ${entityLabel.toLowerCase()} schema report:`,
        error,
      );

      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="starland-btn starland-btn-primary"
      onClick={handleCopy}
    >
      {copied ? (
        <Check
          className="h-4 w-4"
          aria-hidden="true"
        />
      ) : (
        <ClipboardCopy
          className="h-4 w-4"
          aria-hidden="true"
        />
      )}

      {copied
        ? "Schema Report Copied"
        : "Copy Schema Report"}
    </button>
  );
}