import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Database,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import type {
  AttendancePolicySettingsPageData,
  AttendancePolicyValueSource,
} from "../types/attendance-policy-types";

type AttendancePolicyDashboardProps = {
  data: AttendancePolicySettingsPageData;
};

type PolicyValueRowProps = {
  label: string;
  value: string;
  source: AttendancePolicyValueSource;
};

function sourceBadgeClass(
  source: AttendancePolicyValueSource,
): string {
  switch (source) {
    case "DATABASE":
      return "starland-badge-success";

    case "ENVIRONMENT":
      return "starland-badge-info";

    case "DEFAULT":
      return "starland-badge-warning";
  }
}

function SourceBadge({
  source,
}: {
  source: AttendancePolicyValueSource;
}) {
  return (
    <span
      className={[
        "starland-badge",
        sourceBadgeClass(source),
      ].join(" ")}
    >
      {source}
    </span>
  );
}

function PolicyValueRow({
  label,
  value,
  source,
}: PolicyValueRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--starland-border)] py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--starland-dark-text)]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm text-[var(--starland-muted-text)]">
          {value}
        </p>
      </div>

      <div className="shrink-0">
        <SourceBadge source={source} />
      </div>
    </div>
  );
}

export function AttendancePolicyDashboard({
  data,
}: AttendancePolicyDashboardProps) {
  const {
    resolved,
    branches,
  } = data;

  const {
    config,
    sourceMap,
  } = resolved;

  const defaultBranch =
    branches.find(
      (branch) =>
        branch.branchId ===
        config.defaultBranchId,
    ) ?? null;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Database
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Policy Storage
          </p>

          <div className="mt-2">
            <span
              className={[
                "starland-badge",
                resolved.tableExists
                  ? "starland-badge-success"
                  : "starland-badge-danger",
              ].join(" ")}
            >
              {resolved.tableExists
                ? "DATABASE READY"
                : "TABLE MISSING"}
            </span>
          </div>
        </article>

        <article className="starland-card p-4">
          <ShieldCheck
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Stored Policies
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {resolved.databaseRowCount}
          </p>
        </article>

        <article className="starland-card p-4">
          <Building2
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Active Branches
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {branches.length}
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Configuration Warnings
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {resolved.warnings.length}
          </p>
        </article>
      </section>

      {resolved.warnings.length > 0 ? (
        <section className="space-y-3">
          {resolved.warnings.map(
            (warning) => (
              <article
                key={warning}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
              >
                <p className="text-sm font-semibold leading-6 text-amber-800">
                  {warning}
                </p>
              </article>
            ),
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
              aria-hidden="true"
            />

            <div>
              <h2 className="font-extrabold text-green-900">
                Configuration Ready
              </h2>

              <p className="mt-1 text-sm font-semibold leading-6 text-green-800">
                No attendance policy configuration
                warnings were detected.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-start gap-3">
            <Settings2
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Effective Attendance Policies
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
                Each value shows whether it came
                from MySQL, an environment variable,
                or an application default.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-2">
          <PolicyValueRow
            label="Default Attendance Branch"
            value={
              defaultBranch
                ? `${defaultBranch.name} (${defaultBranch.branchCode})`
                : config.defaultBranchId
                  ? `Branch ID ${config.defaultBranchId}`
                  : "No default branch configured"
            }
            source={sourceMap.defaultBranchId}
          />

          <PolicyValueRow
            label="Web Attendance"
            value={
              config.allowWebTimeIn
                ? "Enabled"
                : "Disabled"
            }
            source={sourceMap.allowWebTimeIn}
          />

          <PolicyValueRow
            label="Manual Attendance"
            value={
              config.allowManualTimeIn
                ? "Enabled"
                : "Disabled"
            }
            source={sourceMap.allowManualTimeIn}
          />

          <PolicyValueRow
            label="Photo Requirement"
            value={
              config.requirePhoto
                ? "Required"
                : "Optional"
            }
            source={sourceMap.requirePhoto}
          />

          <PolicyValueRow
            label="Location Requirement"
            value={
              config.requireLocation
                ? "Required"
                : "Optional"
            }
            source={sourceMap.requireLocation}
          />

          <PolicyValueRow
            label="Photo Directory"
            value={config.photoDirectory}
            source={sourceMap.photoDirectory}
          />

          <PolicyValueRow
            label="Maximum Photo Size"
            value={`${config.maxPhotoSizeMb} MB`}
            source={sourceMap.maxPhotoSizeMb}
          />

          <PolicyValueRow
            label="Late Grace Period"
            value={`${config.lateGraceMinutes} minute${
              config.lateGraceMinutes === 1
                ? ""
                : "s"
            }`}
            source={sourceMap.lateGraceMinutes}
          />

          <PolicyValueRow
            label="Automatic Missing Time-Out"
            value={
              config.autoMarkMissingTimeout
                ? "Enabled"
                : "Disabled"
            }
            source={
              sourceMap.autoMarkMissingTimeout
            }
          />

          <PolicyValueRow
            label="Missing Time-Out Threshold"
            value={`${config.missingTimeoutMinutes} minutes`}
            source={
              sourceMap.missingTimeoutMinutes
            }
          />
        </div>
      </section>
    </div>
  );
}

/**
 * Compatibility export retained so any older local import does not fail.
 * New code should use AttendancePolicyDashboard.
 */
export function AttendancePolicyDiscoveryDashboard(
  props: AttendancePolicyDashboardProps,
) {
  return (
    <AttendancePolicyDashboard
      {...props}
    />
  );
}