import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Database,
  FileCog,
  ListTree,
  Settings2,
} from "lucide-react";
import {
  buildAttendancePolicyDiscoveryCopyReport,
} from "../server/attendance-policy-discovery-queries";
import type {
  AttendancePolicyDiscoveryData,
} from "../types/attendance-policy-discovery-types";
import { AttendancePolicyDiscoveryCopyButton } from "./attendance-policy-discovery-copy-button";

type AttendancePolicyDiscoveryDashboardProps = {
  data:
    AttendancePolicyDiscoveryData;
};

function statusContainerClass(
  status:
    AttendancePolicyDiscoveryData["status"],
): string {
  switch (status) {
    case "EXISTING_TABLE_FOUND":
      return "border-green-200 bg-green-50 text-green-800";

    case "NEEDS_DATABASE_STORAGE":
      return "border-blue-200 bg-blue-50 text-blue-800";

    case "MULTIPLE_TABLES_FOUND":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "ERROR":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function settingStatusClass(
  configured: boolean,
  valid: boolean,
): string {
  if (!valid) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (configured) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function AttendancePolicyDiscoveryDashboard({
  data,
}: AttendancePolicyDiscoveryDashboardProps) {
  const copyReport =
    buildAttendancePolicyDiscoveryCopyReport(
      data,
    );

  const existingTables =
    data.candidateTables.filter(
      (candidateTable) =>
        candidateTable.exists,
    );

  const configuredEnvironmentCount =
    data.environmentSettings.filter(
      (setting) =>
        setting.configured,
    ).length;

  const invalidEnvironmentCount =
    data.environmentSettings.filter(
      (setting) =>
        !setting.valid,
    ).length;

  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          statusContainerClass(
            data.status,
          ),
        ].join(" ")}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {data.status ===
            "EXISTING_TABLE_FOUND" ? (
              <CheckCircle2
                className="h-8 w-8 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <CircleAlert
                className="h-8 w-8 shrink-0"
                aria-hidden="true"
              />
            )}

            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">
                Attendance Policy Readiness
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                {data.statusLabel}
              </h2>

              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6">
                {data.statusDescription}
              </p>

              <p className="mt-3 text-xs font-bold">
                Checked: {data.generatedAt}
              </p>
            </div>
          </div>

          {data.status !== "ERROR" ? (
            <AttendancePolicyDiscoveryCopyButton
              report={copyReport}
            />
          ) : null}
        </div>
      </section>

      {data.errorMessage ? (
        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800"
        >
          {data.errorMessage}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Database
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Database
          </p>

          <p className="mt-1 break-words text-lg font-extrabold text-[var(--starland-dark-text)]">
            {data.databaseName ??
              "Unknown"}
          </p>
        </article>

        <article className="starland-card p-4">
          <Settings2
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Configured Environment Values
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {configuredEnvironmentCount}
          </p>
        </article>

        <article className="starland-card p-4">
          <ListTree
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Existing Candidate Tables
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {existingTables.length}
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Configuration Problems
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {invalidEnvironmentCount +
              data.warnings.length}
          </p>
        </article>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <FileCog
              className="h-5 w-5 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Current Environment Configuration
            </h2>
          </div>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Purpose</th>
                <th>Configured</th>
                <th>Value</th>
                <th>Validation</th>
              </tr>
            </thead>

            <tbody>
              {data.environmentSettings.map(
                (setting) => (
                  <tr key={setting.key}>
                    <td>
                      <code className="text-xs font-bold">
                        {setting.key}
                      </code>
                    </td>

                    <td>
                      <div className="min-w-72">
                        <p className="font-bold text-[var(--starland-dark-text)]">
                          {setting.label}
                        </p>

                        <p className="mt-1 whitespace-normal text-xs leading-5 text-[var(--starland-muted-text)]">
                          {setting.description}
                        </p>
                      </div>
                    </td>

                    <td>
                      <span
                        className={[
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
                          settingStatusClass(
                            setting.configured,
                            setting.valid,
                          ),
                        ].join(" ")}
                      >
                        {setting.configured
                          ? "Configured"
                          : "Not configured"}
                      </span>
                    </td>

                    <td>
                      <code className="break-all text-xs">
                        {setting.rawValue ??
                          "—"}
                      </code>
                    </td>

                    <td>
                      {setting.valid ? (
                        <span className="starland-badge starland-badge-success">
                          Valid
                        </span>
                      ) : (
                        <div className="min-w-52">
                          <span className="starland-badge starland-badge-danger">
                            Invalid
                          </span>

                          <p className="mt-2 whitespace-normal text-xs text-red-700">
                            {setting.issue}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Candidate Policy Tables
          </h2>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Common attendance and application
            settings-table names checked in the
            current database.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Table</th>
                <th>Exists</th>
                <th>Records</th>
                <th>Columns</th>
                <th>Indexes</th>
                <th>Relationships</th>
              </tr>
            </thead>

            <tbody>
              {data.candidateTables.map(
                (candidateTable) => (
                  <tr
                    key={
                      candidateTable.tableName
                    }
                  >
                    <td>
                      <code className="text-xs font-bold">
                        {
                          candidateTable.tableName
                        }
                      </code>
                    </td>

                    <td>
                      <span
                        className={[
                          "starland-badge",
                          candidateTable.exists
                            ? "starland-badge-success"
                            : "bg-slate-100 text-slate-700",
                        ].join(" ")}
                      >
                        {candidateTable.exists
                          ? "YES"
                          : "NO"}
                      </span>
                    </td>

                    <td>
                      {candidateTable.recordCount ??
                        "—"}
                    </td>

                    <td>
                      {
                        candidateTable.columns
                          .length
                      }
                    </td>

                    <td>
                      {
                        candidateTable.indexes
                          .length
                      }
                    </td>

                    <td>
                      {candidateTable.foreignKeys
                        .length +
                        candidateTable
                          .incomingForeignKeys
                          .length}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      {existingTables.map(
        (candidateTable) => (
          <section
            key={
              candidateTable.tableName
            }
            className="starland-card overflow-hidden"
          >
            <div className="border-b border-[var(--starland-border)] px-5 py-4">
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                {
                  candidateTable.tableName
                }{" "}
                Columns
              </h2>
            </div>

            <div className="starland-scroll-x">
              <table className="starland-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Column</th>
                    <th>SQL Type</th>
                    <th>Nullable</th>
                    <th>Default</th>
                    <th>Key</th>
                    <th>Extra</th>
                  </tr>
                </thead>

                <tbody>
                  {candidateTable.columns.map(
                    (column) => (
                      <tr
                        key={column.name}
                      >
                        <td>
                          {
                            column.ordinalPosition
                          }
                        </td>

                        <td>
                          <code className="text-xs font-bold">
                            {column.name}
                          </code>
                        </td>

                        <td>
                          <code className="text-xs">
                            {
                              column.columnType
                            }
                          </code>
                        </td>

                        <td>
                          {column.nullable
                            ? "YES"
                            : "NO"}
                        </td>

                        <td>
                          {column.defaultValue ??
                            "NULL"}
                        </td>

                        <td>
                          {column.keyType ??
                            "—"}
                        </td>

                        <td>
                          {column.extra ??
                            "—"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ),
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="starland-card p-5">
          <div className="flex items-start gap-3">
            <Building2
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="font-extrabold text-[var(--starland-dark-text)]">
                Default Attendance Branch
              </h2>

              {data.defaultBranch ? (
                <div className="mt-3">
                  <p className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                    {data.defaultBranch.name}
                  </p>

                  <code className="mt-1 block text-xs font-bold text-[var(--starland-muted-text)]">
                    {
                      data.defaultBranch
                        .branchCode
                    }
                  </code>

                  <p className="mt-2 text-sm text-[var(--starland-muted-text)]">
                    Branch ID:{" "}
                    {
                      data.defaultBranch
                        .branchId
                    }
                  </p>

                  <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                    Status:{" "}
                    {
                      data.defaultBranch
                        .status
                    }
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[var(--starland-muted-text)]">
                  No valid default attendance branch
                  was resolved from the current
                  environment configuration.
                </p>
              )}
            </div>
          </div>
        </article>

        <article className="starland-card p-5">
          <div className="flex items-start gap-3">
            <Database
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="font-extrabold text-[var(--starland-dark-text)]">
                Related Database Tables
              </h2>

              {data.relatedTableNames.length >
              0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.relatedTableNames.map(
                    (tableName) => (
                      <code
                        key={tableName}
                        className="rounded-lg border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs font-bold"
                      >
                        {tableName}
                      </code>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[var(--starland-muted-text)]">
                  No table names containing
                  “setting”, “policy”, or “config”
                  were discovered.
                </p>
              )}
            </div>
          </div>
        </article>
      </section>

      {data.warnings.length > 0 ? (
        <section className="space-y-3">
          {data.warnings.map(
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
      ) : null}

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <h2 className="font-extrabold text-blue-900">
          Recommended Next Action
        </h2>

        <p className="mt-2 text-sm font-semibold leading-6 text-blue-800">
          {data.recommendation}
        </p>
      </section>
    </div>
  );
}