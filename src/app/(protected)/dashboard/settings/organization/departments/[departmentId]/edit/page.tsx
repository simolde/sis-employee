import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Link2,
  Network,
} from "lucide-react";
import {
  notFound,
} from "next/navigation";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { DepartmentForm } from "@/features/settings/organization/departments/components/department-form";
import { updateDepartmentAction } from "@/features/settings/organization/departments/server/department-management-actions";
import {
  getDepartmentDetailData,
  parseDepartmentId,
} from "@/features/settings/organization/departments/server/department-management-queries";

export const dynamic =
  "force-dynamic";

type EditDepartmentPageProps = {
  params: Promise<{
    departmentId: string;
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

export default async function EditDepartmentPage({
  params,
  searchParams,
}: EditDepartmentPageProps) {
  await requireCanManageEmployees();

  const [
    resolvedParams,
    resolvedSearchParams,
  ] = await Promise.all([
    params,
    searchParams,
  ]);

  const departmentId =
    parseDepartmentId(
      resolvedParams.departmentId,
    );

  if (departmentId === null) {
    notFound();
  }

  const data =
    await getDepartmentDetailData(
      departmentId,
    );

  if (!data) {
    notFound();
  }

  const updateAction =
    updateDepartmentAction.bind(
      null,
      departmentId,
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
            Edit Department
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Update {data.department.name}, its code,
            or operational status.
          </p>
        </div>

        <Link
          href="/dashboard/settings/organization/departments"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Department Management
        </Link>
      </div>

      {dependencyBlocked ? (
        <section
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800"
        >
          This department cannot be permanently
          deleted because employees or notices
          reference it. Archive the department
          instead.
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <Network
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                {
                  data.department
                    .departmentCode
                }
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                {data.department.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Department ID:{" "}
                {
                  data.department
                    .departmentId
                }
                . Last updated:{" "}
                {data.department.updatedAt}.
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
            Referencing Records
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.dependencySummary
                .totalReferences
            }
          </p>

          <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
            {data.dependencySummary.canDelete
              ? "This department currently has no employee or notice dependencies."
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
              No employee or notice record currently
              references this department.
            </p>
          )}
        </article>
      </section>

      <DepartmentForm
        mode="EDIT"
        action={updateAction}
        initialDepartment={
          data.department
        }
      />
    </section>
  );
}