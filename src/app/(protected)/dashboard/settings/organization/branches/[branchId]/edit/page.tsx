import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Database,
  Link2,
} from "lucide-react";
import {
  notFound,
} from "next/navigation";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { BranchForm } from "@/features/settings/organization/branches/components/branch-form";
import { updateBranchAction } from "@/features/settings/organization/branches/server/branch-management-actions";
import {
  getBranchDetailData,
  parseBranchId,
} from "@/features/settings/organization/branches/server/branch-management-queries";

export const dynamic =
  "force-dynamic";

type EditBranchPageProps = {
  params: Promise<{
    branchId: string;
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

export default async function EditBranchPage({
  params,
  searchParams,
}: EditBranchPageProps) {
  await requireCanManageEmployees();

  const [
    resolvedParams,
    resolvedSearchParams,
  ] = await Promise.all([
    params,
    searchParams,
  ]);

  const branchId =
    parseBranchId(
      resolvedParams.branchId,
    );

  if (branchId === null) {
    notFound();
  }

  const data =
    await getBranchDetailData(
      branchId,
    );

  if (!data) {
    notFound();
  }

  const updateAction =
    updateBranchAction.bind(
      null,
      branchId,
    );

  const dependencyBlocked =
    firstValue(
      resolvedSearchParams.notice,
    ) ===
    "dependency-blocked";

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Organization Master Data
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Edit Branch
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Update {data.branch.name}, its attendance
            geofence, or operational status.
          </p>
        </div>

        <Link
          href="/dashboard/settings/organization/branches"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Branch Management
        </Link>
      </div>

      {dependencyBlocked ? (
        <section
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800"
        >
          This branch cannot be permanently deleted
          because other database records reference
          it. Archive the branch instead.
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <Building2
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                {data.branch.branchCode}
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                {data.branch.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Branch ID: {data.branch.branchId}.
                Last updated: {data.branch.updatedAt}.
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
              ? "This branch currently has no foreign-key dependencies."
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
                      {dependency.recordCount ===
                      1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--starland-muted-text)]">
              No referencing fields currently contain
              this branch ID.
            </p>
          )}
        </article>
      </section>

      <BranchForm
        mode="EDIT"
        action={updateAction}
        initialBranch={
          data.branch
        }
      />
    </section>
  );
}