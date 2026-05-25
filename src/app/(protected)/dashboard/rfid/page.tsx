import { RfidAssignmentPanel } from "@/features/rfid/components/rfid-assignment-panel";
import { RfidCardList } from "@/features/rfid/components/rfid-card-list";
import { getRfidPageData } from "@/features/rfid/server/rfid-queries";

export default async function RfidPage() {
  const data = await getRfidPageData();

  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          RFID Assignment
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          RFID Cards
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          Assign RFID cards to employees, replace old active cards, prevent
          duplicate active UIDs, disable cards, and keep full RFID history.
        </p>
      </div>

      <RfidAssignmentPanel employees={data.employees} />

      <RfidCardList rfidCards={data.rfidCards} />
    </section>
  );
}