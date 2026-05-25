import { Baby, BriefcaseBusiness, HeartHandshake, UsersRound } from "lucide-react";
import type { EmployeeDetail } from "../types/employee-types";

type EmployeeFamilyBackgroundCardProps = {
  familyBackground: EmployeeDetail["familyBackground"];
  children: EmployeeDetail["children"];
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

function PersonBlock({
  title,
  name,
  address,
  occupation,
}: {
  title: string;
  name: string;
  address: string;
  occupation: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-main-green)]">
        {title}
      </h3>

      <div className="space-y-4">
        <DetailItem label="Full Name" value={name} />
        <DetailItem label="Occupation" value={occupation} />
        <DetailItem label="Address" value={address} />
      </div>
    </div>
  );
}

export function EmployeeFamilyBackgroundCard({
  familyBackground,
  children,
}: EmployeeFamilyBackgroundCardProps) {
  return (
    <section className="starland-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Family Background
          </h2>
          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Father, mother, spouse, employer, and children information.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[var(--starland-success)]">
          <UsersRound className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <PersonBlock
          title="Father"
          name={familyBackground.fatherFullName}
          occupation={familyBackground.fatherOccupation}
          address={familyBackground.fatherAddress}
        />

        <PersonBlock
          title="Mother"
          name={familyBackground.motherFullName}
          occupation={familyBackground.motherOccupation}
          address={familyBackground.motherAddress}
        />

        <PersonBlock
          title="Spouse"
          name={familyBackground.spouseFullName}
          occupation={familyBackground.spouseOccupation}
          address={familyBackground.spouseAddress}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--starland-border)] p-4">
        <div className="mb-4 flex items-center gap-2">
          <BriefcaseBusiness
            className="h-5 w-5 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />
          <h3 className="text-sm font-extrabold text-[var(--starland-dark-text)]">
            Employer
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DetailItem label="Employer" value={familyBackground.employer} />
          <DetailItem label="Phone" value={familyBackground.employerPhone} />
          <DetailItem
            label="Address"
            value={familyBackground.employerAddress}
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--starland-border)] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Baby
            className="h-5 w-5 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />
          <h3 className="text-sm font-extrabold text-[var(--starland-dark-text)]">
            Children
          </h3>
        </div>

        {children.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {children.map((child) => (
              <div
                key={`${child.fullName}-${child.dateOfBirth}`}
                className="rounded-2xl bg-[var(--starland-modern-bg)] p-4"
              >
                <p className="font-bold text-[var(--starland-dark-text)]">
                  {child.fullName}
                </p>
                <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                  Date of Birth: {child.dateOfBirth}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-5 text-sm text-[var(--starland-muted-text)]">
            No child information recorded.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[var(--starland-modern-bg)] p-4 text-xs leading-5 text-[var(--starland-muted-text)]">
        <HeartHandshake
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--starland-main-green)]"
          aria-hidden="true"
        />
        <p>
          Family background is part of the employee HR profile and should only be
          visible to authorized personnel.
        </p>
      </div>
    </section>
  );
}