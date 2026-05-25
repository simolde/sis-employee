import { disableRfidCardAction } from "../server/rfid-actions";
import type { RfidCardListItem } from "../types/rfid-types";

type RfidCardListProps = {
  rfidCards: RfidCardListItem[];
};

function getStatusClass(status: string): string {
  if (status === "ACTIVE") {
    return "starland-badge-success";
  }

  if (status === "DISABLED" || status === "LOST") {
    return "starland-badge-danger";
  }

  return "starland-badge-warning";
}

export function RfidCardList({ rfidCards }: RfidCardListProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          RFID Card History
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Latest active, disabled, lost, and replaced RFID records.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>RFID UID</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Branch</th>
              <th>Assigned</th>
              <th>Disabled</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rfidCards.length > 0 ? (
              rfidCards.map((card) => {
                const disableAction = disableRfidCardAction.bind(
                  null,
                  String(card.rfidId),
                );

                return (
                  <tr key={card.rfidId}>
                    <td className="font-mono font-bold text-[var(--starland-main-green)]">
                      {card.rfidUid}
                    </td>
                    <td>
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        {card.employeeName}
                      </p>
                      <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                        {card.empNumber}
                      </p>
                    </td>
                    <td>{card.departmentName}</td>
                    <td>{card.branchName}</td>
                    <td>{card.assignedAt}</td>
                    <td>{card.disabledAt}</td>
                    <td>
                      <span
                        className={[
                          "starland-badge",
                          getStatusClass(card.status),
                        ].join(" ")}
                      >
                        {card.status}
                      </span>
                    </td>
                    <td>{card.remarks}</td>
                    <td>
                      {card.status === "ACTIVE" ? (
                        <form action={disableAction}>
                          <button
                            type="submit"
                            className="starland-btn starland-btn-danger starland-btn-sm"
                          >
                            Disable
                          </button>
                        </form>
                      ) : (
                        <span
                          aria-disabled="true"
                          className="starland-btn starland-btn-secondary starland-btn-sm"
                        >
                          No Action
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No RFID cards assigned yet
                    </p>
                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Assign an RFID card using the ready-to-scan panel.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}