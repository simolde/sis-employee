import type { ReactNode } from "react";
import {
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  History,
  Link2,
  PauseCircle,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationCronReadinessCheck,
  AttendanceAutomationCronReadinessCheckStatus,
  AttendanceAutomationCronReadinessData,
  AttendanceAutomationCronReadinessStatus,
} from "../types/attendance-automation-cron-readiness-types";

type AttendanceAutomationCronReadinessDashboardProps = {
  data:
    AttendanceAutomationCronReadinessData;
};

function overallContainerClass(
  status:
    AttendanceAutomationCronReadinessStatus,
): string {
  switch (status) {
    case "READY":
      return "border-green-200 bg-green-50 text-green-800";

    case "READY_WITH_WARNINGS":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "BLOCKED":
      return "border-red-200 bg-red-50 text-red-800";

    case "DISABLED":
      return "border-blue-200 bg-blue-50 text-blue-800";
  }
}

function checkContainerClass(
  status:
    AttendanceAutomationCronReadinessCheckStatus,
): string {
  switch (status) {
    case "PASS":
      return "border-green-200 bg-green-50";

    case "WARNING":
      return "border-amber-200 bg-amber-50";

    case "FAIL":
      return "border-red-200 bg-red-50";

    case "SKIPPED":
      return "border-blue-200 bg-blue-50";
  }
}

function checkTextClass(
  status:
    AttendanceAutomationCronReadinessCheckStatus,
): string {
  switch (status) {
    case "PASS":
      return "text-green-800";

    case "WARNING":
      return "text-amber-800";

    case "FAIL":
      return "text-red-800";

    case "SKIPPED":
      return "text-blue-800";
  }
}

function ReadinessStatusIcon({
  status,
  className,
}: {
  status:
    AttendanceAutomationCronReadinessCheckStatus;

  className: string;
}) {
  switch (status) {
    case "PASS":
      return (
        <CheckCircle2
          className={`${className} text-green-700`}
          aria-hidden="true"
        />
      );

    case "WARNING":
      return (
        <TriangleAlert
          className={`${className} text-amber-700`}
          aria-hidden="true"
        />
      );

    case "FAIL":
      return (
        <CircleAlert
          className={`${className} text-red-700`}
          aria-hidden="true"
        />
      );

    case "SKIPPED":
      return (
        <PauseCircle
          className={`${className} text-blue-700`}
          aria-hidden="true"
        />
      );
  }
}

function overallIconStatus(
  status:
    AttendanceAutomationCronReadinessStatus,
): AttendanceAutomationCronReadinessCheckStatus {
  switch (status) {
    case "READY":
      return "PASS";

    case "READY_WITH_WARNINGS":
      return "WARNING";

    case "BLOCKED":
      return "FAIL";

    case "DISABLED":
      return "SKIPPED";
  }
}

function SignalCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <article className="starland-card p-4">
      {icon}

      <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
        {label}
      </p>

      <p className="mt-1 break-words text-xl font-extrabold text-[var(--starland-dark-text)]">
        {value}
      </p>

      <p className="mt-2 text-xs font-semibold leading-5 text-[var(--starland-muted-text)]">
        {description}
      </p>
    </article>
  );
}

function ReadinessCheckCard({
  check,
}: {
  check:
    AttendanceAutomationCronReadinessCheck;
}) {
  return (
    <article
      className={[
        "rounded-2xl border p-5",
        checkContainerClass(
          check.status,
        ),
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <ReadinessStatusIcon
          status={check.status}
          className="mt-0.5 h-6 w-6 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span
                className={[
                  "text-xs font-extrabold uppercase tracking-wide",
                  checkTextClass(
                    check.status,
                  ),
                ].join(" ")}
              >
                {check.status}
              </span>

              <h3
                className={[
                  "mt-1 text-lg font-extrabold",
                  checkTextClass(
                    check.status,
                  ),
                ].join(" ")}
              >
                {check.title}
              </h3>
            </div>

            <code
              className={[
                "break-all text-xs font-bold",
                checkTextClass(
                  check.status,
                ),
              ].join(" ")}
            >
              {check.code}
            </code>
          </div>

          <p
            className={[
              "mt-3 text-sm font-semibold leading-6",
              checkTextClass(
                check.status,
              ),
            ].join(" ")}
          >
            {check.message}
          </p>

          {check.details.length > 0 ? (
            <ul
              className={[
                "mt-4 space-y-2 text-sm font-semibold",
                checkTextClass(
                  check.status,
                ),
              ].join(" ")}
            >
              {check.details.map(
                (detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                    />

                    <span>{detail}</span>
                  </li>
                ),
              )}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function AttendanceAutomationCronReadinessDashboard({
  data,
}: AttendanceAutomationCronReadinessDashboardProps) {
  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          overallContainerClass(
            data.overallStatus,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <ReadinessStatusIcon
            status={overallIconStatus(
              data.overallStatus,
            )}
            className="h-8 w-8 shrink-0"
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Cron Activation Readiness
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {data.overallLabel}
            </h2>

            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6">
              {data.overallDescription}
            </p>

            <p className="mt-3 text-xs font-bold">
              Evaluated: {data.checkedAt}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard
          icon={
            <ClipboardCheck
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />
          }
          label="Total Checks"
          value={data.summary.totalChecks}
          description="Configuration, credentials, schedule, receipt, and history checks."
        />

        <SignalCard
          icon={
            <CheckCircle2
              className="h-7 w-7 text-[var(--starland-success)]"
              aria-hidden="true"
            />
          }
          label="Passed"
          value={data.summary.passedChecks}
          description="Checks that require no corrective action."
        />

        <SignalCard
          icon={
            <TriangleAlert
              className="h-7 w-7 text-[var(--starland-warning)]"
              aria-hidden="true"
            />
          }
          label="Warnings"
          value={data.summary.warningChecks}
          description="Non-blocking conditions that should be reviewed."
        />

        <SignalCard
          icon={
            <CircleAlert
              className="h-7 w-7 text-[var(--starland-danger)]"
              aria-hidden="true"
            />
          }
          label="Failed"
          value={data.summary.failedChecks}
          description="Blocking conditions that prevent reliable production monitoring."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard
          icon={
            <ShieldCheck
              className="h-7 w-7 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
          }
          label="Monitoring"
          value={
            data.monitoring.enabled
              ? "ENABLED"
              : "DISABLED"
          }
          description={`${data.monitoring.variableName}="${data.monitoring.normalizedValue}"`}
        />

        <SignalCard
          icon={
            <Clock3
              className="h-7 w-7 text-[var(--starland-warning)]"
              aria-hidden="true"
            />
          }
          label="Scheduler Receipts"
          value={
            data.signals
              .schedulerHeartbeatState
          }
          description="Combined state of automation and health cron receipts."
        />

        <SignalCard
          icon={
            <History
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />
          }
          label="Receipt History"
          value={
            data.signals.totalReceipts
          }
          description="Hostinger cron receipts within the monitoring window."
        />

        <SignalCard
          icon={
            <Link2
              className="h-7 w-7 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
          }
          label="Environment"
          value={
            data.environment.toUpperCase()
          }
          description={
            data.signals
              .applicationBaseUrl
          }
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <SignalCard
          icon={
            <CheckCircle2
              className="h-7 w-7 text-[var(--starland-success)]"
              aria-hidden="true"
            />
          }
          label="Latest Automation Receipt"
          value={
            data.signals
              .latestAutomationReceiptId !==
            null
              ? `#${data.signals.latestAutomationReceiptId}`
              : "NONE"
          }
          description={
            data.signals
              .latestAutomationOutcome ??
            data.signals
              .automationReceiptState
          }
        />

        <SignalCard
          icon={
            <CheckCircle2
              className="h-7 w-7 text-[var(--starland-success)]"
              aria-hidden="true"
            />
          }
          label="Latest Health Receipt"
          value={
            data.signals
              .latestHealthReceiptId !==
            null
              ? `#${data.signals.latestHealthReceiptId}`
              : "NONE"
          }
          description={
            data.signals
              .latestHealthOutcome ??
            data.signals
              .healthReceiptState
          }
        />
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Cron Readiness Checks
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Failed checks block activation. Warning
            checks allow operation but require
            review. Skipped checks are expected while
            monitoring is disabled.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {data.checks.map((check) => (
            <ReadinessCheckCard
              key={check.code}
              check={check}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
        <p>
          Recommended local configuration:
        </p>

        <code className="mt-2 block rounded-xl border border-blue-200 bg-white/70 px-3 py-2 text-xs">
          ATTENDANCE_AUTOMATION_CRON_ENABLED=&quot;false&quot;
        </code>

        <p className="mt-3">
          Recommended Hostinger configuration after
          both cron jobs and heartbeat scripts are
          deployed:
        </p>

        <code className="mt-2 block rounded-xl border border-blue-200 bg-white/70 px-3 py-2 text-xs">
          ATTENDANCE_AUTOMATION_CRON_ENABLED=&quot;true&quot;
        </code>
      </section>
    </div>
  );
}