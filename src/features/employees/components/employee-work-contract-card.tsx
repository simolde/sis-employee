import { Briefcase, FileSignature } from "lucide-react";
import type { EmployeeDetail } from "../types/employee-types";

type EmployeeWorkContractCardProps = {
  workExperiences: EmployeeDetail["workExperiences"];
  contract: EmployeeDetail["contract"];
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--starland-dark-text)]">
        {value}
      </p>
    </div>
  );
}

export function EmployeeWorkContractCard({
  workExperiences,
  contract,
}: EmployeeWorkContractCardProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <div className="starland-card p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Work Experience
            </h2>
            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              Previous company, position, and inclusive dates.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[var(--starland-warning)]">
            <Briefcase className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>

        {workExperiences.length > 0 ? (
          <div className="space-y-3">
            {workExperiences.map((workExperience) => (
              <div
                key={`${workExperience.company}-${workExperience.position}`}
                className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
              >
                <p className="font-extrabold text-[var(--starland-dark-text)]">
                  {workExperience.company}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--starland-main-green)]">
                  {workExperience.position}
                </p>
                <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
                  Inclusive Dates: {workExperience.inclusiveDates}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-5 text-sm text-[var(--starland-muted-text)]">
            No work experience recorded.
          </div>
        )}
      </div>

      <div className="starland-card p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Contract Signing
            </h2>
            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              Contract dates and signature record.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[var(--starland-success)]">
            <FileSignature className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>

        {contract ? (
          <div className="space-y-4 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <DetailItem label="Date Hired" value={contract.dateHired} />
            <DetailItem
              label="Date of Joining / First Day"
              value={contract.dateOfJoining}
            />
            <DetailItem label="Date Signed" value={contract.dateSigned} />
            <DetailItem label="Signature" value={contract.signature} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-5 text-sm text-[var(--starland-muted-text)]">
            No contract signing record found.
          </div>
        )}
      </div>
    </section>
  );
}