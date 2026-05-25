import { IdCard } from "lucide-react";
import type { EmployeeDetail } from "../types/employee-types";

type EmployeeRfidCardProps = {
  rfidCards: EmployeeDetail["rfidCards"];
};

function getRfidBadgeClass(status: string): string {
  if (status === "ACTIVE") {
    return "starland-badge-success";
  }

  if (status === "DISABLED" || status === "LOST") {
    return "starland-badge-danger";
  }

  return "starland-badge-warning";
}

export function EmployeeRfidCard({ rfidCards }: EmployeeRfidCardProps) {
  return (
    <section className="starland-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            RFID Cards
          </h2>
          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Latest assigned, disabled, lost, or replaced RFID cards.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[var(--starland-info)]">
          <IdCard className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      {rfidCards.length > 0 ? (
        <div className="space-y-3">
          {rfidCards.map((rfidCard) => (
            <div
              key={rfidCard.rfidId}
              className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm font-extrabold text-[var(--starland-dark-text)]">
                  {rfidCard.rfidUid}
                </p>
                <span
                  className={[
                    "starland-badge",
                    getRfidBadgeClass(rfidCard.status),
                  ].join(" ")}
                >
                  {rfidCard.status}
                </span>
              </div>

              <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
                Assigned: {rfidCard.assignedAt}
              </p>
              <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                Disabled: {rfidCard.disabledAt}
              </p>
              <p className="mt-2 text-sm text-[var(--starland-muted-text)]">
                {rfidCard.remarks}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-5 text-sm text-[var(--starland-muted-text)]">
          No RFID card assigned yet.
        </div>
      )}
    </section>
  );
}