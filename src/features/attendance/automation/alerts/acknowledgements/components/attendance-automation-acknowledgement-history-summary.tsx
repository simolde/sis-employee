import {
  CheckCircle2,
  Clock3,
  History,
  RefreshCcw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import type { AttendanceAutomationAcknowledgementHistoryData } from "../types/attendance-automation-alert-acknowledgement-history-types";

type AttendanceAutomationAcknowledgementHistorySummaryProps = {
  data:
    AttendanceAutomationAcknowledgementHistoryData;
};

export function AttendanceAutomationAcknowledgementHistorySummary({
  data,
}: AttendanceAutomationAcknowledgementHistorySummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <article className="starland-card p-4">
        <History
          className="h-7 w-7 text-[var(--starland-info)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Matching Events
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            data.summary
              .totalMatchingRecords
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <ShieldCheck
          className="h-7 w-7 text-[var(--starland-success)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Acknowledged
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            data.summary
              .acknowledgementEvents
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <CheckCircle2
          className="h-7 w-7 text-[var(--starland-success)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Active
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            data.summary
              .activeAcknowledgements
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <Clock3
          className="h-7 w-7 text-[var(--starland-warning)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Expired
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            data.summary
              .expiredAcknowledgements
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <ShieldX
          className="h-7 w-7 text-[var(--starland-danger)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Cleared
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            data.summary
              .clearedAcknowledgements
          }
        </p>
      </article>

      <article className="starland-card p-4">
        <RefreshCcw
          className="h-7 w-7 text-[var(--starland-info)]"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
          Superseded
        </p>

        <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
          {
            data.summary
              .supersededAcknowledgements
          }
        </p>
      </article>
    </section>
  );
}