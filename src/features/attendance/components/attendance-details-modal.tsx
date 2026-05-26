import Link from "next/link";
import { X } from "lucide-react";
import type { AttendanceDetail } from "../types/attendance-types";
import { AttendanceStatusBadge } from "./attendance-status-badge";

type AttendanceDetailsModalProps = {
  detail: AttendanceDetail | null;
  closeHref?: string;
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

function PunchCard({
  title,
  punch,
}: {
  title: string;
  punch: AttendanceDetail["timeIn"];
}) {
  return (
    <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-main-green)]">
        {title}
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailItem label="Time" value={punch.time} />
        <DetailItem label="Source" value={punch.source} />
        <DetailItem label="Branch" value={punch.branchName} />
        <DetailItem label="Latitude" value={punch.latitude} />
        <DetailItem label="Longitude" value={punch.longitude} />
        <DetailItem label="Photo" value={punch.photo} />
      </div>

      <div className="mt-4 grid gap-4">
        <DetailItem label="Address" value={punch.address} />
        <DetailItem label="Remark" value={punch.remark} />
        <DetailItem label="Reason" value={punch.reason} />
      </div>
    </div>
  );
}

export function AttendanceDetailsModal({
  detail,
  closeHref = "/dashboard/attendance",
}: AttendanceDetailsModalProps) {
  if (!detail) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl">
        <div className="starland-card overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--starland-border)] p-5">
            <div>
              <span className="starland-badge starland-badge-info">
                Attendance Details
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-[var(--starland-dark-text)]">
                {detail.employeeName}
              </h2>
              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                {detail.empNumber} · {detail.departmentName}
              </p>
            </div>

            <Link
              href={closeHref}
              className="starland-btn starland-btn-secondary starland-btn-sm"
              aria-label="Close attendance details"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Close
            </Link>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
              <DetailItem label="Date" value={detail.attDate} />
              <DetailItem label="Schedule" value={detail.scheduleName} />
              <DetailItem label="Shift" value={detail.shiftTime} />
              <DetailItem label="Total Hours" value={detail.totalHours} />
              <DetailItem label="Employee Branch" value={detail.branchName} />
              <DetailItem
                label="Manual?"
                value={detail.isManual ? "Yes" : "No"}
              />
              <DetailItem
                label="Synced?"
                value={detail.isSynced ? "Yes" : "No"}
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Status
                </p>
                <div className="mt-2">
                  <AttendanceStatusBadge status={detail.status} />
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <PunchCard title="Time In" punch={detail.timeIn} />
              <PunchCard title="Time Out" punch={detail.timeOut} />
            </div>

            <div className="rounded-2xl border border-[var(--starland-border)] p-4">
              <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
                Verification
              </h3>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DetailItem label="Verified By" value={detail.verifiedBy} />
                <DetailItem label="Verified At" value={detail.verifiedAt} />
                <DetailItem label="Approved By" value={detail.approvedBy} />
                <DetailItem label="Approved At" value={detail.approvedAt} />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--starland-border)] p-4">
              <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
                Attendance Logs
              </h3>

              {detail.logs.length > 0 ? (
                <div className="starland-scroll-x">
                  <table className="starland-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Punched At</th>
                        <th>Source</th>
                        <th>Branch</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.logs.map((log) => (
                        <tr key={log.logId}>
                          <td>{log.punchType.replaceAll("_", " ")}</td>
                          <td>{log.punchedAt}</td>
                          <td>{log.source}</td>
                          <td>{log.branchName}</td>
                          <td>{log.latitude}</td>
                          <td>{log.longitude}</td>
                          <td>{log.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-5 text-sm text-[var(--starland-muted-text)]">
                  No punch logs recorded yet.
                </div>
              )}
            </div>

            <p className="text-xs text-[var(--starland-muted-text)]">
              Created: {detail.createdAt} · Last updated: {detail.updatedAt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}