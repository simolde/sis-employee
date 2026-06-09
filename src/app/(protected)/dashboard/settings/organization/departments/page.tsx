import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  CircleOff,
  DatabaseSearch,
  Network,
  Plus,
  Search,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { DepartmentManagementTable } from "@/features/settings/organization/departments/components/department-management-table";
import { getDepartmentListData } from "@/features/settings/organization/departments/server/department-management-queries";
import {
  DEPARTMENT_PAGE_SIZES,
  DEPARTMENT_STATUSES,
  type DepartmentListRawFilters,
} from "@/features/settings/organization/departments/types/department-management-types";

export const dynamic =
  "force-dynamic";

type DepartmentSettingsPageProps = {
  searchParams: Promise<
    DepartmentListRawFilters & {
      notice?:
        | string
        | string[];

      departmentId?:
        | string
        | string[];
    }
  >;
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

function getNotice(
  value: string,
): {
  style: string;
  message: string;
} | null {
  switch (value) {
    case "created":
      return {
        style:
          "border-green-200 bg-green-50 text-green-800",

        message:
          "The department was created successfully.",
      };

    case "updated":
      return {
        style:
          "border-green-200 bg-green-50 text-green-800",

        message:
          "The department was updated successfully.",
      };

    case "status-updated":
      return {
        style:
          "border-green-200 bg-green-50 text-green-800",

        message:
          "The department status was updated successfully.",
      };

    case "no-change":
      return {
        style:
          "border-blue-200 bg-blue-50 text-blue-800",

        message:
          "The department already has the selected status.",
      };

    case "deleted":
      return {
        style:
          "border-green-200 bg-green-50 text-green-800",

        message:
          "The unused department was permanently deleted.",
      };

    case "delete-error":
      return {
        style:
          "border-red-200 bg-red-50 text-red-800",

        message:
          "The department could not be deleted. It may still be referenced by another record.",
      };

    case "status-error":
      return {
        style:
          "border-red-200 bg-red-50 text-red-800",

        message:
          "The department status could not be updated.",
      };

    case "invalid-request":
      return {
        style:
          "border-red-200 bg-red-50 text-red-800",

        message:
          "The department request was invalid.",
      };

    default:
      return null;
  }
}

export default async function DepartmentSettingsPage({
  searchParams,
}: DepartmentSettingsPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const data =
    await getDepartmentListData(
      resolvedSearchParams,
    );

  const notice =
    getNotice(
      firstValue(
        resolvedSearchParams.notice,
      ),
    );

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Organization Master Data
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Department Management
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Manage administrative, academic,
            maintenance, accounting, registrar,
            cashier, motorpool, and other school
            departments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/settings/organization/departments/new"
            className="starland-btn starland-btn-primary"
          >
            <Plus
              className="h-4 w-4"
              aria-hidden="true"
            />

            New Department
          </Link>

          <Link
            href="/dashboard/settings/organization/departments/schema"
            className="starland-btn starland-btn-soft"
          >
            <DatabaseSearch
              className="h-4 w-4"
              aria-hidden="true"
            />

            Schema Inspector
          </Link>

          <Link
            href="/dashboard/settings/organization"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Organization Structure
          </Link>
        </div>
      </div>

      {notice ? (
        <section
          role="status"
          className={[
            "rounded-2xl border p-4 text-sm font-semibold leading-6",
            notice.style,
          ].join(" ")}
        >
          {notice.message}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Network
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Departments
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .totalDepartments
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Active
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .activeDepartments
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleOff
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Inactive
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .inactiveDepartments
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <Archive
            className="h-7 w-7 text-slate-600"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Archived
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .archivedDepartments
            }
          </p>
        </article>
      </section>

      <section className="starland-card p-4">
        <form
          method="get"
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_160px_auto]"
        >
          <div>
            <label
              htmlFor="q"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Search
            </label>

            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--starland-muted-text)]"
                aria-hidden="true"
              />

              <input
                id="q"
                name="q"
                type="search"
                className="starland-input pl-9"
                defaultValue={
                  data.filters.q
                }
                placeholder="Department code or name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              className="starland-input mt-2"
              defaultValue={
                data.filters.status
              }
            >
              <option value="">
                All statuses
              </option>

              {DEPARTMENT_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="pageSize"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Rows
            </label>

            <select
              id="pageSize"
              name="pageSize"
              className="starland-input mt-2"
              defaultValue={String(
                data.filters.pageSize,
              )}
            >
              {DEPARTMENT_PAGE_SIZES.map(
                (pageSize) => (
                  <option
                    key={pageSize}
                    value={pageSize}
                  >
                    {pageSize}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="starland-btn starland-btn-primary"
            >
              <Search
                className="h-4 w-4"
                aria-hidden="true"
              />

              Apply
            </button>

            <Link
              href="/dashboard/settings/organization/departments"
              className="starland-btn starland-btn-soft"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <DepartmentManagementTable
        data={data}
      />
    </section>
  );
}