"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertTriangle, Eye, Loader2 } from "lucide-react";
import { markMissingTimeoutAction } from "../server/missing-timeout-actions";
import {
  initialMissingTimeoutActionState,
  type MissingTimeoutPageData,
} from "../types/missing-timeout-types";

type MissingTimeoutTableProps = {
  data: MissingTimeoutPageData;
};

function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

export function MissingTimeoutTable({ data }: MissingTimeoutTableProps) {
  const [state, formAction, isPending] = useActionState(
    markMissingTimeoutAction,
    initialMissingTimeoutActionState,
  );

  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Eligible Missing Timeouts
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
              Records shown here have time-in but no time-out and are old enough
              to be marked as missing timeout.
            </p>
          </div>

          <form action={formAction}>
            <button
              type="submit"
              name="mode"
              value="MARK_ALL"
              className="starland-btn starland-btn-primary"
              disabled={isPending || data.records.length === 0}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              )}
              Mark All Eligible
            </button>
          </form>
        </div>

        {state.message ? (
          <div
            className={[
              "mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
              state.ok
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
          >
            {state.message}
          </div>
        ) : null}
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch / Department</th>
              <th>Schedule / Shift</th>
              <th>Date</th>
              <th>Time In</th>
              <th>Source</th>
              <th>Status</th>
              <th>Age</th>
              <th>Manual?</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.records.length > 0 ? (
              data.records.map((record) => (
                <tr key={record.attendanceId}>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {record.employeeName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {record.empNumber}
                    </p>
                  </td>

                  <td>
                    <p>{record.branchName}</p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {record.departmentName}
                    </p>
                  </td>

                  <td>
                    <p>{record.scheduleName}</p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {record.shiftTime}
                    </p>
                  </td>

                  <td>{record.attDate}</td>
                  <td>{record.timeIn}</td>
                  <td>{record.source}</td>

                  <td>
                    <span className="starland-badge starland-badge-warning">
                      {formatStatusLabel(record.status)}
                    </span>
                  </td>

                  <td>{record.ageHours} hr(s)</td>

                  <td>
                    {record.isManual ? (
                      <span className="starland-badge starland-badge-warning">
                        YES
                      </span>
                    ) : (
                      <span className="starland-badge starland-badge-success">
                        NO
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/attendance/${record.attendanceId}`}
                        className="starland-btn starland-btn-soft starland-btn-sm"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View
                      </Link>

                      <form action={formAction}>
                        <input
                          type="hidden"
                          name="attendanceId"
                          value={record.attendanceId}
                        />

                        <button
                          type="submit"
                          name="mode"
                          value="MARK_SINGLE"
                          className="starland-btn starland-btn-primary starland-btn-sm"
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <AlertTriangle
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          Mark
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No eligible missing timeouts
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      There are no old time-in records without time-out that need
                      to be marked right now.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}