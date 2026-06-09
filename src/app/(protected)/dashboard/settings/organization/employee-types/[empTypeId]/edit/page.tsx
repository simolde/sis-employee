import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Link2,
  UsersRound,
} from "lucide-react";
import {
  notFound,
} from "next/navigation";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { EmployeeTypeForm } from "@/features/settings/organization/employee-types/components/employee-type-form";
import { updateEmployeeTypeAction } from "@/features/settings/organization/employee-types/server/employee-type-management-actions";
import {
  getEmployeeTypeDetailData,
  parseEmployeeTypeId,
} from "@/features/settings/organization/employee-types/server/employee-type-management-queries";

export const dynamic = "force-dynamic";

type EditEmployeeTypePageProps = {
  params: Promise<{
    empTypeId: string;
  }>;

  searchParams: Promise<{
    notice?:
      | string
      | string[];
  }>;
};

function firstValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function EditEmployeeTypePage({
  params,
  searchParams,
}: EditEmployeeTypePageProps) {
  await requireCanManageEmployees();

  const [
    resolvedParams,
    resolvedSearchParams,
  ] = await Promise.all([
    params,
    searchParams,
  ]);

  const empTypeId =
    parseEmployeeTypeId(
      resolvedParams.empTypeId,
    );

  if (empTypeId === null) {
    notFound();
  }

  const data =
    await getEmployeeTypeDetailData(
      empTypeId,
    );

  if (!data) {
    notFound();
  }

  const updateAction =
    updateEmployeeTypeAction.bind(
      null,
      empTypeId,
    );

  const dependencyBlocked =
    firstValue(
      resolvedSearchParams.notice,
    ) === "dependency-blocked";

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Organization Master Data
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Edit Employee Type
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Update {data.employeeType.name}, its
            code, or operational status.
          </p>
        </div>

        <Link
          href="/dashboard/settings/organization/employee-types"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Employee Type Management
        </Link>
      </div>

      {dependencyBlocked ? (
        <section
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800"
        >
          This employee type cannot be permanently
          deleted because one or more employees
          reference it. Archive the employee type
          instead.
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <UsersRound
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                {
                  data.employeeType
                    .empTypeCode
                }
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                {data.employeeType.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Employee Type ID:{" "}
                {
                  data.employeeType
                    .empTypeId
                }
                . Last updated:{" "}
                {data.employeeType.updatedAt}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="starland-card p-4">
          <Database
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Referencing Employees
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.dependencySummary
                .totalReferences
            }
          </p>

          <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
            {data.dependencySummary.canDelete
              ? "No employee currently references this employee type."
              : "Permanent deletion is protected."}
          </p>
        </article>

        <article className="starland-card p-4">
          <Link2
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Referencing Fields
          </p>

          {data.dependencySummary
            .dependencies.length > 0 ? (
            <div className="mt-3 space-y-2">
              {data.dependencySummary.dependencies.map(
                (dependency) => (
                  <div
                    key={[
                      dependency.tableName,
                      dependency.columnName,
                    ].join(":")}
                    className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3"
                  >
                    <code className="text-xs font-bold">
                      {
                        dependency.tableName
                      }
                      .
                      {
                        dependency.columnName
                      }
                    </code>

                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {
                        dependency.recordCount
                      }{" "}
                      referencing record
                      {dependency.recordCount === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--starland-muted-text)]">
              No employee record currently references
              this employee type.
            </p>
          )}
        </article>
      </section>

      <EmployeeTypeForm
        mode="EDIT"
        action={updateAction}
        initialEmployeeType={
          data.employeeType
        }
      />
    </section>
  );
}