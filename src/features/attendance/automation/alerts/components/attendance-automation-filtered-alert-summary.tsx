import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  CircleDashed,
  Info,
  TriangleAlert,
} from "lucide-react";
import type { AttendanceAutomationFilteredAlertResult } from "../types/attendance-automation-alert-filter-types";

type AttendanceAutomationFilteredAlertSummaryProps = {
  result:
    AttendanceAutomationFilteredAlertResult;
};

export function AttendanceAutomationFilteredAlertSummary({
  result,
}: AttendanceAutomationFilteredAlertSummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article className="starland-card p-4">
        <BellRing
          className="h-7 w-7 text-[var(--starland-info)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Matching Alerts
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            result.summary
              .totalMatchingAlerts
          }
        </p>

        <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
          {result.summary.hasActiveFilters
            ? "Filtered result"
            : "All active alerts"}
        </p>
      </article>

      <article className="starland-card p-4">
        <AlertCircle
          className="h-7 w-7 text-[var(--starland-danger)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Matching Critical
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            result.summary
              .matchingCriticalAlerts
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <TriangleAlert
          className="h-7 w-7 text-[var(--starland-warning)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Matching Warnings
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            result.summary
              .matchingWarningAlerts
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <Info
          className="h-7 w-7 text-[var(--starland-info)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Matching Information
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            result.summary
              .matchingInformationalAlerts
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <CheckCircle2
          className="h-7 w-7 text-[var(--starland-success)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Acknowledged
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            result.summary
              .acknowledgedAlerts
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <CircleDashed
          className="h-7 w-7 text-[var(--starland-warning)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Needs Acknowledgement
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            result.summary
              .unacknowledgedAlerts
          }
        </p>
      </article>
    </section>
  );
}