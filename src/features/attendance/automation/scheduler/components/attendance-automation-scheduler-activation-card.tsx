import {
  CheckCircle2,
  PauseCircle,
  Power,
  TriangleAlert,
} from "lucide-react";
import type { AttendanceAutomationSchedulerMonitoringConfiguration } from "../server/attendance-automation-scheduler-monitoring-config";

type AttendanceAutomationSchedulerActivationCardProps = {
  configuration:
    AttendanceAutomationSchedulerMonitoringConfiguration;
};

function containerClass(
  configuration:
    AttendanceAutomationSchedulerMonitoringConfiguration,
): string {
  if (!configuration.valid) {
    return "border-amber-200 bg-amber-50";
  }

  if (configuration.enabled) {
    return "border-green-200 bg-green-50";
  }

  return "border-blue-200 bg-blue-50";
}

function textClass(
  configuration:
    AttendanceAutomationSchedulerMonitoringConfiguration,
): string {
  if (!configuration.valid) {
    return "text-amber-800";
  }

  if (configuration.enabled) {
    return "text-green-800";
  }

  return "text-blue-800";
}

function ActivationIcon({
  configuration,
}: AttendanceAutomationSchedulerActivationCardProps) {
  const className =
    "h-7 w-7 shrink-0";

  if (!configuration.valid) {
    return (
      <TriangleAlert
        className={`${className} text-amber-700`}
        aria-hidden="true"
      />
    );
  }

  if (configuration.enabled) {
    return (
      <CheckCircle2
        className={`${className} text-green-700`}
        aria-hidden="true"
      />
    );
  }

  return (
    <PauseCircle
      className={`${className} text-blue-700`}
      aria-hidden="true"
    />
  );
}

export function AttendanceAutomationSchedulerActivationCard({
  configuration,
}: AttendanceAutomationSchedulerActivationCardProps) {
  return (
    <section
      className={[
        "rounded-2xl border p-5",
        containerClass(
          configuration,
        ),
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <ActivationIcon
          configuration={
            configuration
          }
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Power
              className={[
                "h-4 w-4",
                textClass(
                  configuration,
                ),
              ].join(" ")}
              aria-hidden="true"
            />

            <p
              className={[
                "text-xs font-extrabold uppercase tracking-wide",
                textClass(
                  configuration,
                ),
              ].join(" ")}
            >
              Scheduler Monitoring Activation
            </p>
          </div>

          <h2
            className={[
              "mt-2 text-xl font-extrabold",
              textClass(
                configuration,
              ),
            ].join(" ")}
          >
            {configuration.statusLabel}
          </h2>

          <p
            className={[
              "mt-2 max-w-4xl text-sm font-semibold leading-6",
              textClass(
                configuration,
              ),
            ].join(" ")}
          >
            {
              configuration
                .statusDescription
            }
          </p>

          <code
            className={[
              "mt-4 block rounded-xl border bg-white/70 px-3 py-2 text-xs font-bold",
              configuration.valid
                ? configuration.enabled
                  ? "border-green-200 text-green-800"
                  : "border-blue-200 text-blue-800"
                : "border-amber-200 text-amber-800",
            ].join(" ")}
          >
            {
              configuration
                .variableName
            }
            =&quot;
            {
              configuration
                .normalizedValue
            }
            &quot;
          </code>

          <div
            className={[
              "mt-4 space-y-2 text-sm font-semibold leading-6",
              textClass(
                configuration,
              ),
            ].join(" ")}
          >
            <p>
              Local development:
              {" "}
              <code>
                ATTENDANCE_AUTOMATION_CRON_ENABLED=&quot;false&quot;
              </code>
            </p>

            <p>
              Hostinger production after both cron
              jobs are installed:
              {" "}
              <code>
                ATTENDANCE_AUTOMATION_CRON_ENABLED=&quot;true&quot;
              </code>
            </p>

            <p>
              Restart the Node.js application after
              changing the environment value.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}