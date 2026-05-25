import { CalendarDays, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { getInitials } from "@/lib/utils/formatting";
import type { EmployeeDetail } from "../types/employee-types";
import { EmployeeStatusBadge } from "./employee-status-badge";

type EmployeeDetailCardProps = {
  employee: EmployeeDetail;
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
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

export function EmployeeDetailCard({ employee }: EmployeeDetailCardProps) {
  const profile = employee.profile;

  return (
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-2xl font-extrabold">
            {getInitials({
              firstName: profile.fullName.split(" ")[0],
              lastName: profile.fullName.split(" ").at(-1),
            })}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight">
                {profile.fullName}
              </h2>
              <EmployeeStatusBadge status={profile.status} />
            </div>

            <p className="mt-1 text-sm font-medium text-white/70">
              {profile.empNumber} · {profile.designationName}
            </p>

            <div className="mt-4 grid gap-2 text-sm text-white/80 md:grid-cols-3">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {profile.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {profile.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {profile.branchName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
            <UserRound className="h-5 w-5" aria-hidden="true" />
            Profile Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="First Record ID" value={`#${profile.empId}`} />
            <DetailItem label="PRC" value={profile.prc} />
            <DetailItem label="Gender" value={profile.gender} />
            <DetailItem label="Date of Birth" value={profile.dob} />
            <DetailItem label="Place of Birth" value={profile.pob} />
            <DetailItem label="Civil Status" value={profile.civilStatus} />
            <DetailItem label="Citizenship" value={profile.citizenship} />
            <DetailItem label="Landline" value={profile.landline} />
            <DetailItem label="Available Leave" value={profile.avLeave} />
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <DetailItem label="Address" value={profile.address} />
          </div>
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[var(--starland-dark-text)]">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
            Work Information
          </h3>

          <div className="space-y-4 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <DetailItem label="Department" value={profile.departmentName} />
            <DetailItem label="Employee Type" value={profile.empTypeName} />
            <DetailItem label="Schedule" value={profile.scheduleName} />
            <DetailItem label="Shift Time" value={profile.shiftTime} />
            <DetailItem
              label="Flexible Schedule"
              value={profile.isFlexible ? "Yes" : "No"}
            />
            <DetailItem label="Date Hired" value={profile.dateHired} />
            <DetailItem label="Date Signed" value={profile.dateSigned} />
          </div>
        </div>
      </div>
    </section>
  );
}