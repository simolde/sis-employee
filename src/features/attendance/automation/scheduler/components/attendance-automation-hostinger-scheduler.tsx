"use client";

import {
  Check,
  Clipboard,
  Clock3,
  Code2,
  FileKey,
  HeartPulse,
  Play,
  ServerCog,
  ShieldCheck,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import {
  useCallback,
  useState,
} from "react";
import type {
  AttendanceAutomationSchedulerData,
  AttendanceAutomationSchedulerTask,
} from "../types/attendance-automation-scheduler-types";

type AttendanceAutomationHostingerSchedulerProps = {
  data: AttendanceAutomationSchedulerData;
};

type CopyTarget =
  | "environment"
  | "automation-expression"
  | "automation-command"
  | "health-expression"
  | "health-command";

type CopyButtonProps = {
  target: CopyTarget;
  value: string;

  copiedTarget: CopyTarget | null;

  onCopy: (
    target: CopyTarget,
    value: string,
  ) => Promise<void>;
};

type SchedulerTaskCardProps = {
  task: AttendanceAutomationSchedulerTask;

  expressionTarget: CopyTarget;
  commandTarget: CopyTarget;

  copiedTarget: CopyTarget | null;

  onCopy: (
    target: CopyTarget,
    value: string,
  ) => Promise<void>;
};

function CopyButton({
  target,
  value,
  copiedTarget,
  onCopy,
}: CopyButtonProps) {
  const copied =
    copiedTarget === target;

  return (
    <button
      type="button"
      className="starland-btn starland-btn-soft starland-btn-sm"
      onClick={() =>
        void onCopy(target, value)
      }
    >
      {copied ? (
        <Check
          className="h-4 w-4"
          aria-hidden="true"
        />
      ) : (
        <Clipboard
          className="h-4 w-4"
          aria-hidden="true"
        />
      )}

      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SchedulerTaskCard({
  task,
  expressionTarget,
  commandTarget,
  copiedTarget,
  onCopy,
}: SchedulerTaskCardProps) {
  const TaskIcon =
    task.kind === "AUTOMATION"
      ? Play
      : HeartPulse;

  return (
    <article className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-start gap-3">
          <TaskIcon
            className="mt-0.5 h-6 w-6 shrink-0 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              {task.title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
              {task.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <Clock3
            className="h-6 w-6 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
            Application Time
          </p>

          <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
            {task.manilaTimeLabel}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <ServerCog
            className="h-6 w-6 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
            Hostinger Cron Time
          </p>

          <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
            {task.utcTimeLabel}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-5 pb-5">
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-[var(--starland-dark-text)]">
              Cron Expression
            </p>

            <CopyButton
              target={expressionTarget}
              value={task.cronExpression}
              copiedTarget={copiedTarget}
              onCopy={onCopy}
            />
          </div>

          <pre className="mt-2 overflow-x-auto rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-sm font-bold text-[var(--starland-dark-text)]">
            <code>
              {task.cronExpression}
            </code>
          </pre>
        </div>

        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-[var(--starland-dark-text)]">
              hPanel Command
            </p>

            <CopyButton
              target={commandTarget}
              value={task.cronCommandExample}
              copiedTarget={copiedTarget}
              onCopy={onCopy}
            />
          </div>

          <pre className="mt-2 overflow-x-auto rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-xs leading-6 text-[var(--starland-dark-text)]">
            <code>
              {task.cronCommandExample}
            </code>
          </pre>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
          <p>
            Project script:
          </p>

          <code className="mt-2 block break-all rounded-xl border border-blue-200 bg-white/70 px-3 py-2 text-xs">
            {task.projectScriptPath}
          </code>

          <p className="mt-3">
            Upload using Linux LF line endings and
            replace the account/path placeholders
            with the actual private Hostinger path.
          </p>
        </div>
      </div>
    </article>
  );
}

export function AttendanceAutomationHostingerScheduler({
  data,
}: AttendanceAutomationHostingerSchedulerProps) {
  const [copiedTarget, setCopiedTarget] =
    useState<CopyTarget | null>(null);

  const handleCopy = useCallback(
    async (
      target: CopyTarget,
      value: string,
    ): Promise<void> => {
      try {
        await navigator.clipboard.writeText(
          value,
        );

        setCopiedTarget(target);

        window.setTimeout(() => {
          setCopiedTarget((current) =>
            current === target
              ? null
              : current,
          );
        }, 2000);
      } catch {
        setCopiedTarget(null);
      }
    },
    [],
  );

  return (
    <div className="space-y-5">
      {data.warnings.length > 0 ? (
        <section className="space-y-3">
          {data.warnings.map((warning) => (
            <article
              key={warning}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex items-start gap-3">
                <TriangleAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                  aria-hidden="true"
                />

                <p className="text-sm font-semibold leading-6 text-amber-800">
                  {warning}
                </p>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
              aria-hidden="true"
            />

            <div>
              <h2 className="font-extrabold text-green-800">
                Scheduler configuration checks passed
              </h2>

              <p className="mt-1 text-sm font-semibold text-green-700">
                The application URL, secret, and
                scheduler values are configured.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        <SchedulerTaskCard
          task={data.automationTask}
          expressionTarget="automation-expression"
          commandTarget="automation-command"
          copiedTarget={copiedTarget}
          onCopy={handleCopy}
        />

        <SchedulerTaskCard
          task={data.healthTask}
          expressionTarget="health-expression"
          commandTarget="health-command"
          copiedTarget={copiedTarget}
          onCopy={handleCopy}
        />
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <FileKey
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Private Cron Environment File
            </h2>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Store the scheduler secret outside the
            public website directory. Do not commit
            this file to Git.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="text-sm font-bold text-[var(--starland-dark-text)]">
              Example private path
            </p>

            <code className="mt-2 block overflow-x-auto rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs font-semibold text-[var(--starland-dark-text)]">
              {
                data.privateEnvironmentPathExample
              }
            </code>
          </div>

          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-[var(--starland-dark-text)]">
                File contents
              </p>

              <CopyButton
                target="environment"
                value={data.environmentTemplate}
                copiedTarget={copiedTarget}
                onCopy={handleCopy}
              />
            </div>

            <pre className="mt-2 overflow-x-auto whitespace-pre rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-xs leading-6 text-[var(--starland-dark-text)]">
              <code>
                {data.environmentTemplate}
              </code>
            </pre>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
            Replace the placeholder secret with the
            exact value configured in{" "}
            <code>
              ATTENDANCE_AUTOMATION_SECRET
            </code>
            . Never place the real secret directly
            inside the cron command.
          </div>
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Terminal
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Hostinger Installation Order
            </h2>
          </div>
        </div>

        <ol className="space-y-4 p-5 text-sm font-semibold leading-6 text-[var(--starland-dark-text)]">
          <li className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <strong>1.</strong> Create a private
            directory outside the public web root.
          </li>

          <li className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <strong>2.</strong> Upload both shell
            scripts from the project{" "}
            <code>scripts</code> directory.
          </li>

          <li className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <strong>3.</strong> Create the private{" "}
            <code>
              .attendance-automation-cron.env
            </code>{" "}
            file using the template above.
          </li>

          <li className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <strong>4.</strong> In hPanel Cron Jobs,
            add the automation expression and its
            shell-script command.
          </li>

          <li className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <strong>5.</strong> Add the health-check
            expression and its shell-script command.
          </li>

          <li className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <strong>6.</strong> Review cron output,
            Run History, Automation Health, and
            Alerts after the first scheduled run.
          </li>
        </ol>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
        <div className="flex items-start gap-3">
          <Code2
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <p>
            Current application schedule:{" "}
            <strong>
              {data.automationTask.manilaTimeLabel}
            </strong>
            . Hostinger schedule:{" "}
            <strong>
              {data.automationTask.utcTimeLabel}
            </strong>
            . The health check runs{" "}
            {data.healthCheckBufferMinutes} minutes
            after the configured grace deadline.
          </p>
        </div>
      </section>
    </div>
  );
}