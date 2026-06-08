import type { ReactNode } from "react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { getFilteredAttendanceAutomationAlerts } from "@/features/attendance/automation/alerts/server/attendance-automation-alert-filter-queries";
import type { AttendanceAutomationAlertOverallStatus } from "@/features/attendance/automation/alerts/types/attendance-automation-alert-types";
import { AttendanceAutomationSubnav } from "@/features/attendance/automation/components/attendance-automation-subnav";

export const dynamic = "force-dynamic";

type AttendanceAutomationLayoutProps = {
  children: ReactNode;
};

function getUnacknowledgedAlertStatus(input: {
  criticalAlerts: number;
  warningAlerts: number;
}): AttendanceAutomationAlertOverallStatus {
  if (input.criticalAlerts > 0) {
    return "CRITICAL";
  }

  if (input.warningAlerts > 0) {
    return "ATTENTION";
  }

  return "HEALTHY";
}

export default async function AttendanceAutomationLayout({
  children,
}: AttendanceAutomationLayoutProps) {
  await requireCanManageEmployees();

  const result =
    await getFilteredAttendanceAutomationAlerts({
      q: "",
      severity: "",
      code: "",
    });

  const unacknowledgedAlerts =
    result.alerts.filter(
      (alert) =>
        alert.acknowledgement === null,
    );

  const unacknowledgedCriticalAlerts =
    unacknowledgedAlerts.filter(
      (alert) =>
        alert.severity === "CRITICAL",
    ).length;

  const unacknowledgedWarningAlerts =
    unacknowledgedAlerts.filter(
      (alert) =>
        alert.severity === "WARNING",
    ).length;

  const alertStatus =
    getUnacknowledgedAlertStatus({
      criticalAlerts:
        unacknowledgedCriticalAlerts,

      warningAlerts:
        unacknowledgedWarningAlerts,
    });

  return (
    <div className="space-y-5">
      <AttendanceAutomationSubnav
        alertCount={
          unacknowledgedAlerts.length
        }
        alertStatus={alertStatus}
      />

      {children}
    </div>
  );
}