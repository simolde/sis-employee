import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  History,
  Info,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { getCurrentSession } from "@/features/auth/server/session";
import { getOdlAttendancePageData } from "@/features/attendance/server/attendance-form-queries";
import { getOdlEligibilityProfile } from "@/features/attendance/odl-eligibility/server/odl-eligibility-queries";

function getPunchLabel(punchState: string): string {
  if (punchState === "TIME_IN") {
    return "TIME IN";
  }

  if (punchState === "TIME_OUT") {
    return "TIME OUT";
  }

  if (punchState === "WAITING") {
    return "WAITING";
  }

  if (punchState === "DONE") {
    return "COMPLETED";
  }

  return "BLOCKED";
}

function checkBadgeClass(ok: boolean): string {
  return ok ? "starland-badge-success" : "starland-badge-danger";
}

export default async function OdlEligibilityPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const [odlPageData, eligibility] = await Promise.all([
    getOdlAttendancePageData(),
    getOdlEligibilityProfile(session.userId),
  ]);

  const employee = eligibility.profile?.employee ?? null;
  const canPunch =
    odlPageData.punchState === "TIME_IN" ||
    odlPageData.punchState === "TIME_OUT";

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            ODL Eligibility
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            ODL Attendance Eligibility Check
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Use this page to check why the logged-in account is allowed or
            blocked from ODL web time-in and time-out.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/odl/history"
            className="starland-btn starland-btn-primary"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            ODL History
          </Link>

          <Link
            href="/dashboard/attendance/odl"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to ODL
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "starland-badge",
                canPunch ? "starland-badge-success" : "starland-badge-warning",
              ].join(" ")}
            >
              NEXT ACTION: {getPunchLabel(odlPageData.punchState)}
            </span>

            {canPunch ? (
              <span className="starland-badge starland-badge-success">
                Submit Allowed
              </span>
            ) : (
              <span className="starland-badge starland-badge-warning">
                Submit Blocked
              </span>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            {eligibility.profile?.username ?? "Unknown User"}
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            {odlPageData.message}
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UserRound className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              User Account
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {eligibility.profile?.username ?? "—"}
            </p>

            <p className="mt-1 break-all text-xs font-semibold text-[var(--starland-muted-text)]">
              {eligibility.profile?.email ?? "—"}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              User Status
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {eligibility.profile?.userStatus ?? "—"}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              User ID: {eligibility.profile?.userId ?? "—"}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Employee Profile
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {employee?.empNumber ?? "—"}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              {employee?.fullName ?? "No linked employee"}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Info className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Current Result
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {getPunchLabel(odlPageData.punchState)}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Time In: {odlPageData.timeInAt} · Time Out:{" "}
              {odlPageData.timeOutAt}
            </p>
          </article>
        </div>
      </section>

      {employee ? (
        <section className="starland-card p-5">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Linked Employee Details
          </h2>

          <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
              <dt className="font-bold text-[var(--starland-muted-text)]">
                Department
              </dt>
              <dd className="mt-1 font-extrabold text-[var(--starland-dark-text)]">
                {employee.departmentName}
              </dd>
            </div>

            <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
              <dt className="font-bold text-[var(--starland-muted-text)]">
                Designation
              </dt>
              <dd className="mt-1 font-extrabold text-[var(--starland-dark-text)]">
                {employee.designationName}
              </dd>
            </div>

            <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
              <dt className="font-bold text-[var(--starland-muted-text)]">
                Employee Type
              </dt>
              <dd className="mt-1 font-extrabold text-[var(--starland-dark-text)]">
                {employee.employeeTypeName}
              </dd>
            </div>

            <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
              <dt className="font-bold text-[var(--starland-muted-text)]">
                Branch
              </dt>
              <dd className="mt-1 font-extrabold text-[var(--starland-dark-text)]">
                {employee.branchName}
              </dd>
            </div>

            <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
              <dt className="font-bold text-[var(--starland-muted-text)]">
                Schedule
              </dt>
              <dd className="mt-1 font-extrabold text-[var(--starland-dark-text)]">
                {employee.scheduleName}
              </dd>
            </div>

            <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
              <dt className="font-bold text-[var(--starland-muted-text)]">
                Flexible Flag
              </dt>
              <dd className="mt-1 font-extrabold text-[var(--starland-dark-text)]">
                {employee.isFlexible ? "YES" : "NO"}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Eligibility Checks
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            These checks help identify common profile setup problems. The final
            submit decision still follows the ODL attendance server policy.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {eligibility.checks.map((check) => (
            <article
              key={check.label}
              className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
                    {check.label}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--starland-muted-text)]">
                    {check.value}
                  </p>
                </div>

                <span
                  className={[
                    "starland-badge",
                    checkBadgeClass(check.ok),
                  ].join(" ")}
                >
                  {check.ok ? "OK" : "Check"}
                </span>
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-[var(--starland-muted-text)]">
                {check.ok ? (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--starland-success)]"
                    aria-hidden="true"
                  />
                ) : (
                  <XCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--starland-danger)]"
                    aria-hidden="true"
                  />
                )}

                <p>{check.helpText}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}