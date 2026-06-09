import {
  CheckCircle2,
  CircleAlert,
  Database,
  FileKey2,
  KeyRound,
  Link2,
  ListTree,
  Table2,
} from "lucide-react";
import {
  buildOrganizationTableSchemaCopyReport,
} from "../server/organization-table-schema-queries";
import type {
  OrganizationTableSchemaInspectionData,
} from "../types/organization-table-schema-types";
import { OrganizationTableSchemaCopyButton } from "./organization-table-schema-copy-button";

type OrganizationTableSchemaDashboardProps = {
  data:
    OrganizationTableSchemaInspectionData;
};

function statusContainerClass(
  status:
    OrganizationTableSchemaInspectionData["status"],
): string {
  switch (status) {
    case "READY":
      return "border-green-200 bg-green-50 text-green-800";

    case "MISSING":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "ERROR":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function displayValue(
  value:
    | string
    | number
    | boolean
    | null,
): string {
  if (value === null) {
    return "NULL";
  }

  if (typeof value === "boolean") {
    return value
      ? "true"
      : "false";
  }

  return String(value);
}

export function OrganizationTableSchemaDashboard({
  data,
}: OrganizationTableSchemaDashboardProps) {
  const copyReport =
    buildOrganizationTableSchemaCopyReport(
      data,
    );

  const detectedFieldRows = [
    [
      "Primary ID",
      data.detectedFields.idColumn,
    ],
    [
      "Display Name",
      data.detectedFields.nameColumn,
    ],
    [
      "Code",
      data.detectedFields.codeColumn,
    ],
    [
      "Branch ID",
      data.detectedFields.branchIdColumn,
    ],
    [
      "Department ID",
      data.detectedFields.departmentIdColumn,
    ],
    [
      "Description",
      data.detectedFields.descriptionColumn,
    ],
    [
      "Status",
      data.detectedFields.statusColumn,
    ],
    [
      "Created At",
      data.detectedFields.createdAtColumn,
    ],
    [
      "Updated At",
      data.detectedFields.updatedAtColumn,
    ],
  ] as const;

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
            "READY" ? (
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
                {data.entityLabel} CRUD Readiness
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

          {data.tableExists ? (
            <OrganizationTableSchemaCopyButton
              report={copyReport}
              entityLabel={
                data.entityLabel
              }
            />
          ) : null}
        </div>
      </section>

      {data.errorMessage ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="break-words text-sm font-semibold leading-6 text-red-800">
            {data.errorMessage}
          </p>
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
          <Table2
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Columns
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.columns.length}
          </p>
        </article>

        <article className="starland-card p-4">
          <ListTree
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            {data.entityPluralLabel}
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.recordCount}
          </p>
        </article>

        <article className="starland-card p-4">
          <KeyRound
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Required Inputs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.requiredInsertColumns
                .length
            }
          </p>
        </article>
      </section>

      {data.crudReadiness
        .blockingReasons.length >
      0 ? (
        <section className="space-y-3">
          {data.crudReadiness.blockingReasons.map(
            (reason) => (
              <article
                key={reason}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
              >
                <p className="text-sm font-semibold leading-6 text-amber-800">
                  {reason}
                </p>
              </article>
            ),
          )}
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="starland-card overflow-hidden">
          <div className="border-b border-[var(--starland-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <FileKey2
                className="h-5 w-5 text-[var(--starland-main-green)]"
                aria-hidden="true"
              />

              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Detected Fields
              </h2>
            </div>
          </div>

          <dl className="divide-y divide-[var(--starland-border)]">
            {detectedFieldRows.map(
              ([
                label,
                value,
              ]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <dt className="text-sm font-bold text-[var(--starland-muted-text)]">
                    {label}
                  </dt>

                  <dd>
                    {value ? (
                      <code className="rounded-lg bg-[var(--starland-modern-bg)] px-2 py-1 text-xs font-bold text-[var(--starland-dark-text)]">
                        {value}
                      </code>
                    ) : (
                      <span className="starland-badge starland-badge-warning">
                        Not detected
                      </span>
                    )}
                  </dd>
                </div>
              ),
            )}
          </dl>
        </article>

        <article className="starland-card overflow-hidden">
          <div className="border-b border-[var(--starland-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <KeyRound
                className="h-5 w-5 text-[var(--starland-warning)]"
                aria-hidden="true"
              />

              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Required Insert Columns
              </h2>
            </div>
          </div>

          <div className="p-5">
            {data.requiredInsertColumns
              .length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.requiredInsertColumns.map(
                  (column) => (
                    <code
                      key={column}
                      className="rounded-lg border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs font-bold text-[var(--starland-dark-text)]"
                    >
                      {column}
                    </code>
                  ),
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--starland-muted-text)]">
                No mandatory insert columns were
                detected beyond generated or
                defaulted fields.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            {data.entityLabel} Table Columns
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
                <th>Comment</th>
              </tr>
            </thead>

            <tbody>
              {data.columns.length >
              0 ? (
                data.columns.map(
                  (column) => (
                    <tr key={column.name}>
                      <td>
                        {column.ordinalPosition}
                      </td>

                      <td>
                        <code className="text-xs font-bold">
                          {column.name}
                        </code>
                      </td>

                      <td>
                        <code className="text-xs">
                          {column.columnType}
                        </code>
                      </td>

                      <td>
                        <span
                          className={[
                            "starland-badge",
                            column.nullable
                              ? "starland-badge-info"
                              : "starland-badge-warning",
                          ].join(" ")}
                        >
                          {column.nullable
                            ? "YES"
                            : "NO"}
                        </span>
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

                      <td>
                        {column.comment ??
                          "—"}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                      No table columns were found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="starland-card overflow-hidden">
          <div className="border-b border-[var(--starland-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <KeyRound
                className="h-5 w-5 text-[var(--starland-main-green)]"
                aria-hidden="true"
              />

              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Indexes
              </h2>
            </div>
          </div>

          <div className="starland-scroll-x">
            <table className="starland-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Columns</th>
                </tr>
              </thead>

              <tbody>
                {data.indexes.length >
                0 ? (
                  data.indexes.map(
                    (index) => (
                      <tr key={index.name}>
                        <td>
                          <code className="text-xs font-bold">
                            {index.name}
                          </code>
                        </td>

                        <td>
                          {index.primary
                            ? "PRIMARY"
                            : index.unique
                              ? "UNIQUE"
                              : "INDEX"}
                        </td>

                        <td>
                          {index.columns.join(
                            ", ",
                          )}
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                        No indexes were found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="starland-card overflow-hidden">
          <div className="border-b border-[var(--starland-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <Link2
                className="h-5 w-5 text-[var(--starland-info)]"
                aria-hidden="true"
              />

              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Outgoing References
              </h2>
            </div>
          </div>

          <div className="starland-scroll-x">
            <table className="starland-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>References</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {data.foreignKeys
                  .length > 0 ? (
                  data.foreignKeys.map(
                    (foreignKey) => (
                      <tr
                        key={
                          foreignKey.constraintName
                        }
                      >
                        <td>
                          <code className="text-xs">
                            {
                              foreignKey.columnName
                            }
                          </code>
                        </td>

                        <td>
                          <code className="text-xs">
                            {
                              foreignKey
                                .referencedTableName
                            }
                            .
                            {
                              foreignKey
                                .referencedColumnName
                            }
                          </code>
                        </td>

                        <td>
                          {foreignKey.deleteRule ??
                            "—"}
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                        No outgoing foreign keys were
                        found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="starland-card overflow-hidden">
          <div className="border-b border-[var(--starland-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <Link2
                className="h-5 w-5 text-[var(--starland-warning)]"
                aria-hidden="true"
              />

              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Incoming References
              </h2>
            </div>
          </div>

          <div className="starland-scroll-x">
            <table className="starland-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Column</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {data.incomingForeignKeys
                  .length > 0 ? (
                  data.incomingForeignKeys.map(
                    (foreignKey) => (
                      <tr
                        key={[
                          foreignKey.constraintName,
                          foreignKey.referencingTableName,
                          foreignKey.referencingColumnName,
                        ].join(":")}
                      >
                        <td>
                          <code className="text-xs">
                            {
                              foreignKey
                                .referencingTableName
                            }
                          </code>
                        </td>

                        <td>
                          <code className="text-xs">
                            {
                              foreignKey
                                .referencingColumnName
                            }
                          </code>
                        </td>

                        <td>
                          {foreignKey.deleteRule ??
                            "—"}
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                        No incoming foreign keys were
                        found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Existing {data.entityPluralLabel}
          </h2>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Read-only sample limited to the first 10
            records.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                {data.sampleColumnNames.map(
                  (columnName) => (
                    <th key={columnName}>
                      {columnName}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {data.sampleRows.length >
              0 ? (
                data.sampleRows.map(
                  (
                    row,
                    rowIndex,
                  ) => (
                    <tr
                      key={`${data.tableName}-sample-${rowIndex}`}
                    >
                      {data.sampleColumnNames.map(
                        (columnName) => (
                          <td key={columnName}>
                            <div className="max-w-72 whitespace-normal break-words text-sm">
                              {displayValue(
                                row[
                                  columnName
                                ] ?? null,
                              )}
                            </div>
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={Math.max(
                      1,
                      data.sampleColumnNames
                        .length,
                    )}
                  >
                    <div className="p-6 text-center text-sm text-[var(--starland-muted-text)]">
                      The {data.tableName} table
                      contains no records.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}