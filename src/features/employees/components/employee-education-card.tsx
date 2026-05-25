import { GraduationCap } from "lucide-react";
import type { EmployeeDetail } from "../types/employee-types";

type EmployeeEducationCardProps = {
  education: EmployeeDetail["education"];
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

export function EmployeeEducationCard({
  education,
}: EmployeeEducationCardProps) {
  return (
    <section className="starland-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Educational Background
          </h2>
          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Elementary, secondary, vocational, college, masters, doctorate, and
            LET passer status.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[var(--starland-info)]">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
          LET Passer?
        </p>
        <div className="mt-2">
          <span
            className={[
              "starland-badge",
              education.letPasser
                ? "starland-badge-success"
                : "starland-badge-warning",
            ].join(" ")}
          >
            {education.letPasser ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {education.backgrounds.length > 0 ? (
        <div className="space-y-4">
          {education.backgrounds.map((background) => (
            <div
              key={background.level}
              className="rounded-2xl border border-[var(--starland-border)] p-4"
            >
              <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-main-green)]">
                {background.level}
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <DetailItem
                  label="School Name"
                  value={background.schoolName}
                />
                <DetailItem
                  label="Year Graduated / Year"
                  value={background.yearGraduated}
                />
                <DetailItem label="Course" value={background.course} />
                <DetailItem label="Units" value={background.units} />
                <DetailItem
                  label="Academic Honors"
                  value={background.academicHonors}
                />
                <DetailItem label="Address" value={background.address} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-5 text-sm text-[var(--starland-muted-text)]">
          No educational background recorded.
        </div>
      )}
    </section>
  );
}