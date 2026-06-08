import type {
  AttendanceAutomationSchedulerHeartbeatData,
  AttendanceAutomationSchedulerHeartbeatOutcome,
  AttendanceAutomationSchedulerTaskHeartbeatStatus,
} from "@/features/attendance/automation/scheduler/heartbeats/types/attendance-automation-scheduler-heartbeat-types";
import type {
  AttendanceAutomationAlertItem,
  AttendanceAutomationAlertSeverity,
} from "../types/attendance-automation-alert-types";

export type AttendanceAutomationHeartbeatAlertDraft =
  Omit<
    AttendanceAutomationAlertItem,
    "detectedAt"
  >;

const CRON_RECEIPTS_URL =
  "/dashboard/attendance/automation/scheduler/heartbeats";

function getAutomationOutcomeSeverity(
  outcome:
    | AttendanceAutomationSchedulerHeartbeatOutcome
    | undefined,
): AttendanceAutomationAlertSeverity {
  switch (outcome) {
    case "FAILED":
      return "CRITICAL";

    case "ATTENTION":
      return "WARNING";

    case "SKIPPED":
      return "INFO";

    case "SUCCESS":
    default:
      return "WARNING";
  }
}

function getHealthOutcomeSeverity(
  outcome:
    | AttendanceAutomationSchedulerHeartbeatOutcome
    | undefined,
): AttendanceAutomationAlertSeverity {
  switch (outcome) {
    case "FAILED":
    case "ATTENTION":
      return "WARNING";

    case "SKIPPED":
      return "INFO";

    case "SUCCESS":
    default:
      return "WARNING";
  }
}

function buildReceiptDetails(
  status:
    AttendanceAutomationSchedulerTaskHeartbeatStatus,
): string[] {
  const receipt =
    status.latestReceipt;

  const details: string[] = [
    `Expected scheduling window: ${status.expectedAt}.`,
  ];

  if (!receipt) {
    details.push(
      "No scheduler receipt exists in the current monitoring window.",
    );

    details.push(
      "Confirm that the Hostinger cron job is enabled and uses the updated shell script.",
    );

    return details;
  }

  details.push(
    `Latest receipt: #${receipt.activityLogId}, recorded ${receipt.createdAt}.`,
  );

  details.push(
    `Receipt outcome: ${receipt.outcome}.`,
  );

  details.push(
    receipt.httpStatus !== null
      ? `Endpoint HTTP status: ${receipt.httpStatus}.`
      : "No endpoint HTTP status was recorded.",
  );

  details.push(
    `Execution duration: ${receipt.durationLabel}.`,
  );

  if (receipt.message) {
    details.push(
      `Receipt message: ${receipt.message}`,
    );
  }

  return details;
}

function buildAutomationReceiptAlert(
  status:
    AttendanceAutomationSchedulerTaskHeartbeatStatus,
): AttendanceAutomationHeartbeatAlertDraft | null {
  if (
    status.state === "HEALTHY" ||
    status.state === "DISABLED"
  ) {
    return null;
  }

  if (status.state === "MISSING") {
    return {
      code:
        "AUTOMATION_CRON_RECEIPT_MISSING",

      severity: "CRITICAL",

      title:
        "Hostinger automation cron receipt is missing",

      message:
        status.stateDescription,

      details:
        buildReceiptDetails(status),

      action: {
        label:
          "Open Cron Receipts",

        href:
          CRON_RECEIPTS_URL,
      },
    };
  }

  const outcome =
    status.latestReceipt?.outcome;

  return {
    code:
      "AUTOMATION_CRON_RECEIPT_ATTENTION",

    severity:
      getAutomationOutcomeSeverity(
        outcome,
      ),

    title:
      outcome === "FAILED"
        ? "Hostinger automation cron failed"
        : outcome === "SKIPPED"
          ? "Hostinger automation cron was skipped"
          : "Hostinger automation cron requires review",

    message:
      status.stateDescription,

    details:
      buildReceiptDetails(status),

    action: {
      label:
        "Review Automation Receipt",

      href:
        CRON_RECEIPTS_URL,
    },
  };
}

function buildHealthReceiptAlert(
  status:
    AttendanceAutomationSchedulerTaskHeartbeatStatus,
): AttendanceAutomationHeartbeatAlertDraft | null {
  if (
    status.state === "HEALTHY" ||
    status.state === "DISABLED"
  ) {
    return null;
  }

  if (status.state === "MISSING") {
    return {
      code:
        "HEALTH_CRON_RECEIPT_MISSING",

      severity: "WARNING",

      title:
        "Hostinger health cron receipt is missing",

      message:
        status.stateDescription,

      details:
        buildReceiptDetails(status),

      action: {
        label:
          "Open Cron Receipts",

        href:
          CRON_RECEIPTS_URL,
      },
    };
  }

  const outcome =
    status.latestReceipt?.outcome;

  return {
    code:
      "HEALTH_CRON_RECEIPT_ATTENTION",

    severity:
      getHealthOutcomeSeverity(
        outcome,
      ),

    title:
      outcome === "FAILED"
        ? "Hostinger health cron failed"
        : outcome === "SKIPPED"
          ? "Hostinger health cron was skipped"
          : "Hostinger health cron requires review",

    message:
      status.stateDescription,

    details:
      buildReceiptDetails(status),

    action: {
      label:
        "Review Health Receipt",

      href:
        CRON_RECEIPTS_URL,
    },
  };
}

export function buildAttendanceAutomationSchedulerHeartbeatAlerts(
  data:
    AttendanceAutomationSchedulerHeartbeatData,
): AttendanceAutomationHeartbeatAlertDraft[] {
  if (!data.monitoring.enabled) {
    return [];
  }

  const alerts:
    AttendanceAutomationHeartbeatAlertDraft[] =
    [];

  const automationAlert =
    buildAutomationReceiptAlert(
      data.taskStatus.automation,
    );

  if (automationAlert) {
    alerts.push(automationAlert);
  }

  const healthAlert =
    buildHealthReceiptAlert(
      data.taskStatus.health,
    );

  if (healthAlert) {
    alerts.push(healthAlert);
  }

  return alerts;
}