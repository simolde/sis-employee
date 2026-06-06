"use client";

import {
  Check,
  Clipboard,
  Code2,
  HeartPulse,
  Play,
  Terminal,
} from "lucide-react";
import {
  useCallback,
  useState,
} from "react";
import type { AttendanceAutomationConfigurationData } from "../types/attendance-automation-configuration-types";

type AttendanceAutomationCommandBuilderProps = {
  data: AttendanceAutomationConfigurationData;
};

type CopyTarget =
  | "powershell-run"
  | "powershell-health"
  | "curl-run"
  | "curl-health";

type CommandCardProps = {
  title: string;
  description: string;
  command: string;
  target: CopyTarget;
  copiedTarget: CopyTarget | null;
  onCopy: (
    target: CopyTarget,
    command: string,
  ) => Promise<void>;
};

function buildPowerShellHeader(
  data: AttendanceAutomationConfigurationData,
): string {
  return [
    "$headers = @{",
    `  "${data.secret.requestHeaderName}" = $env:${data.secret.environmentVariableName}`,
    "}",
  ].join("\n");
}

function buildPowerShellRunCommand(
  data: AttendanceAutomationConfigurationData,
): string {
  return [
    buildPowerShellHeader(data),
    "",
    "Invoke-RestMethod `",
    "  -Method Post `",
    `  -Uri "${data.automationEndpointUrl}?limit=100" \``,
    "  -Headers $headers",
  ].join("\n");
}

function buildPowerShellHealthCommand(
  data: AttendanceAutomationConfigurationData,
): string {
  return [
    buildPowerShellHeader(data),
    "",
    "Invoke-RestMethod `",
    "  -Method Get `",
    `  -Uri "${data.healthEndpointUrl}" \``,
    "  -Headers $headers",
  ].join("\n");
}

function buildCurlRunCommand(
  data: AttendanceAutomationConfigurationData,
): string {
  return [
    "curl.exe -X POST `",
    `  "${data.automationEndpointUrl}?limit=100" \``,
    `  -H "${data.secret.requestHeaderName}: $env:${data.secret.environmentVariableName}"`,
  ].join("\n");
}

function buildCurlHealthCommand(
  data: AttendanceAutomationConfigurationData,
): string {
  return [
    "curl.exe -X GET `",
    `  "${data.healthEndpointUrl}" \``,
    `  -H "${data.secret.requestHeaderName}: $env:${data.secret.environmentVariableName}"`,
  ].join("\n");
}

function CommandCard({
  title,
  description,
  command,
  target,
  copiedTarget,
  onCopy,
}: CommandCardProps) {
  const copied =
    copiedTarget === target;

  return (
    <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-extrabold text-[var(--starland-dark-text)]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
            {description}
          </p>
        </div>

        <button
          type="button"
          className="starland-btn starland-btn-soft starland-btn-sm shrink-0"
          onClick={() =>
            void onCopy(target, command)
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
      </div>

      <pre className="mt-4 overflow-x-auto whitespace-pre rounded-2xl border border-[var(--starland-border)] bg-white p-4 text-xs leading-6 text-[var(--starland-dark-text)]">
        <code>{command}</code>
      </pre>
    </article>
  );
}

export function AttendanceAutomationCommandBuilder({
  data,
}: AttendanceAutomationCommandBuilderProps) {
  const [copiedTarget, setCopiedTarget] =
    useState<CopyTarget | null>(null);

  const handleCopy = useCallback(
    async (
      target: CopyTarget,
      command: string,
    ): Promise<void> => {
      try {
        await navigator.clipboard.writeText(
          command,
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

  const powerShellRun =
    buildPowerShellRunCommand(data);

  const powerShellHealth =
    buildPowerShellHealthCommand(data);

  const curlRun =
    buildCurlRunCommand(data);

  const curlHealth =
    buildCurlHealthCommand(data);

  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Terminal
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Scheduler Commands
          </h2>
        </div>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          These commands reference the secret
          through an environment variable. The
          actual secret is never displayed on this
          page.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {!data.secret.configured ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Configure the automation secret before
            running these commands.
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Code2
              className="h-5 w-5 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <h3 className="font-extrabold text-[var(--starland-dark-text)]">
              PowerShell
            </h3>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <CommandCard
              title="Run Approved-Leave Automation"
              description="Calls the protected automation endpoint using Invoke-RestMethod."
              command={powerShellRun}
              target="powershell-run"
              copiedTarget={copiedTarget}
              onCopy={handleCopy}
            />

            <CommandCard
              title="Check Automation Health"
              description="Checks scheduler compliance, failures, configuration, and lock state."
              command={powerShellHealth}
              target="powershell-health"
              copiedTarget={copiedTarget}
              onCopy={handleCopy}
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Play
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h3 className="font-extrabold text-[var(--starland-dark-text)]">
              curl.exe
            </h3>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <CommandCard
              title="Run Approved-Leave Automation"
              description="Suitable for Windows Task Scheduler or manual terminal testing."
              command={curlRun}
              target="curl-run"
              copiedTarget={copiedTarget}
              onCopy={handleCopy}
            />

            <CommandCard
              title="Check Automation Health"
              description="Returns HTTP 200 when healthy and HTTP 503 when attention is required."
              command={curlHealth}
              target="curl-health"
              copiedTarget={copiedTarget}
              onCopy={handleCopy}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
          <div className="flex items-start gap-2">
            <HeartPulse
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />

            <p>
              Schedule the automation endpoint near{" "}
              {data.schedule.scheduleLabel}. The
              health endpoint should be checked
              separately after the configured grace
              period.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}