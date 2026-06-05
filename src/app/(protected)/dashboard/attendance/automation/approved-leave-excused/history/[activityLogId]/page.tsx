import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  Clock3,
  CloudCog,
  FileJson,
  History,
  LayoutDashboard,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ApprovedLeaveAutomationRelatedRuns } from "@/features/attendance/automation/history/components/approved-leave-automation-related-runs";
import { ApprovedLeaveAutomationRetryPanel } from "@/features/attendance/automation/history/components/approved-leave-automation-retry-panel";
import {
  getApprovedLeaveAutomationHistoryDetail,
  getApprovedLeaveAutomationRelatedRuns,
} from "@/features/attendance/automation/history/server/approved-leave-automation-history-queries";
import type {
  ApprovedLeaveAutomationExecutionMode,
  ApprovedLeaveAutomationRunStatus,
} from "@/features/attendance/automation/history/types/approved-leave-automation-history-types";

type ApprovedLeaveAutomationHistoryDetailPageProps = {
  params: Promise<{
    activityLogId: string;
  }>;
};

type AutomationAuditMetadata = {
  failureMessage: string | null;
  attemptedGeneratedCount: number;
  committedChanges: boolean | null;
};

function parseActivityLogId(
  value: string,
): number | null {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

function readAutomationAuditMetadata(
  newValueText: string,
): AutomationAuditMetadata {
  try {
    const parsed: unknown =
      JSON.parse(newValueText);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {
        failureMessage: null,
        attemptedGeneratedCount: 0,
        committedChanges: null,
      };
    }

    const object = parsed as Record<
      string,
      unknown
    >;

    return {
      failureMessage:
        typeof object.failureMessage ===
          "string" &&
        object.failureMessage.trim()
          ? object.failureMessage.trim()
          : null,

      attemptedGeneratedCount:
        typeof object.attemptedGeneratedCount ===
          "number" &&
        Number.isFinite(
          object.attemptedGeneratedCount,
        )
          ? object.attemptedGeneratedCount
          : 0,

      committedChanges:
        typeof object.committedChanges ===
        "boolean"
          ? object.committedChanges
          : null,
    };
  } catch {
    return {
      failureMessage: null,
      attemptedGeneratedCount: 0,
      committedChanges: null,
    };
  }
}

function ExecutionBadge({
  executionMode,
}: {
  executionMode: ApprovedLeaveAutomationExecutionMode;
}) {
  if (executionMode === "API") {
    return (
      <span className="starland-badge starland-badge-info">
        <CloudCog
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
        API / SYSTEM
      </span>
    );
  }

  return (
    <span className="starland-badge starland-badge-success">
      <LayoutDashboard
        className="h-3.5 w-3.5"
        aria-hidden="true"
      />
      DASHBOARD
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: ApprovedLeaveAutomationRunStatus;
}) {
  if (status === "FAILED") {
    return (
      <span className="starland-badge starland-badge-danger">
        FAILED
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className="starland-badge starland-badge-success">
        COMPLETED
      </span>
    );
  }

  return (
    <span className="starland-badge starland-badge-warning">
      UNKNOWN
    </span>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <p className="text-sm font-bold text-[var(--starland-muted-text)]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
        {value}
      </p>
    </article>
  );
}

function JsonValueCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <article className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <FileJson
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            {title}
          </h2>
        </div>
      </div>

      <div className="p-5">
        <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-xs leading-6 text-[var(--starland-dark-text)]">
          {value}
        </pre>
      </div>
    </article>
  );
}

export default async function ApprovedLeaveAutomationHistoryDetailPage({
  params,
}: ApprovedLeaveAutomationHistoryDetailPageProps) {
  await requireCanManageEmployees();

  const resolvedParams = await params;

  const activityLogId =
    parseActivityLogId(
      resolvedParams.activityLogId,
    );

  if (!activityLogId) {
    notFound();
  }

  const [detail, relatedRuns] =
    await Promise.all([
      getApprovedLeaveAutomationHistoryDetail(
        activityLogId,
      ),

      getApprovedLeaveAutomationRelatedRuns(
        activityLogId,
      ),
    ]);

  if (!detail || !relatedRuns) {
    notFound();
  }

  const metadata =
    readAutomationAuditMetadata(
      detail.newValueText,
    );

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Automation Run Detail
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Run #{detail.activityLogId}
          </h1>

          <p className="mt-2 max-w-3xl break-all text-sm leading-6 text-[var(--starland-muted-text)]">
            {detail.runKey}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/attendance/audit/${detail.activityLogId}`}
            className="starland-btn starland-btn-primary"
          >
            <History
              className="h-4 w-4"
              aria-hidden="true"
            />
            Open Full Audit
          </Link>

          <Link
            href="/dashboard/attendance/automation/approved-leave-excused/history"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
            Run History
          </Link>
        </div>
      </div>

      {detail.status === "FAILED" ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <TriangleAlert
              className="mt-0.5 h-6 w-6 shrink-0 text-red-700"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-red-800">
                Automation Transaction Failed
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-700">
                {metadata.failureMessage ??
                  "The automation failed before the transaction could complete."}
              </p>

              <p className="mt-2 text-xs font-semibold text-red-700">
                Attempted generated records:{" "}
                {metadata.attemptedGeneratedCount}. Committed generated
                records: {detail.generatedCount}.
              </p>

              <p className="mt-1 text-xs font-semibold text-red-700">
                The transaction was rolled back, so attempted records were not
                saved.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <ApprovedLeaveAutomationRetryPanel
        activityLogId={
          detail.activityLogId
        }
        status={detail.status}
      />

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex flex-wrap gap-2">
            <ExecutionBadge
              executionMode={
                detail.executionMode
              }
            />

            <StatusBadge
              status={detail.status}
            />

            {detail.retryOfRunAuditLogId ? (
              <span className="starland-badge starland-badge-warning">
                RETRY OF #{detail.retryOfRunAuditLogId}
              </span>
            ) : null}
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Approved-Leave EXCUSED Automation
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            This record contains execution settings, processing totals,
            duration, audit actor, commit status, and retry lineage.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Duration
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {detail.durationLabel}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Committed Generated
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {detail.generatedCount}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-6 w-6 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Checked
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {detail.checkedCount}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TriangleAlert className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Skipped
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {detail.skippedCount}
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="starland-card p-5">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Execution Information
          </h2>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Activity Log ID
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.activityLogId}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Actor
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.actorUserId ??
                  "SYSTEM"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Started
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.startedAt}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Completed
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.completedAt}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Processing Limit
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.limit}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Retry Of Run
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.retryOfRunAuditLogId
                  ? `#${detail.retryOfRunAuditLogId}`
                  : "Original run"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Changes Committed
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {metadata.committedChanges ===
                null
                  ? "UNKNOWN"
                  : metadata.committedChanges
                    ? "YES"
                    : "NO"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="starland-card p-5">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Processing Filters
          </h2>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Attendance From
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.attendanceDateFrom}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Attendance To
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.attendanceDateTo}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Employee Search
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.employeeSearch ||
                  "All employees"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Branch ID
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.branchId ||
                  "All branches"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Department ID
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {detail.departmentId ||
                  "All departments"}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Existing Attendance"
          value={
            detail.existingAttendanceCount
          }
        />

        <MetricCard
          label="No Approved Leave"
          value={
            detail.noApprovedLeaveCount
          }
        />

        <MetricCard
          label="Exception Protected"
          value={
            detail.exceptionProtectedCount
          }
        />

        <MetricCard
          label="Not Scheduled"
          value={
            detail.notScheduledCount
          }
        />
      </section>

      <ApprovedLeaveAutomationRelatedRuns
        currentRunId={
          detail.activityLogId
        }
        relatedRuns={relatedRuns}
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <JsonValueCard
          title="Old Audit Value"
          value={detail.oldValueText}
        />

        <JsonValueCard
          title="New Audit Value"
          value={detail.newValueText}
        />
      </section>
    </section>
  );
}