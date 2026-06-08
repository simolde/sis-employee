import type { ReactNode } from "react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { getAttendanceAutomationAlertCenterData } from "@/features/attendance/automation/alerts/server/attendance-automation-alert-queries";
import { AttendanceAutomationSubnav } from "@/features/attendance/automation/components/attendance-automation-subnav";

export const dynamic = "force-dynamic";

type AttendanceAutomationLayoutProps = {
  children: ReactNode;
};

export default async function AttendanceAutomationLayout({
  children,
}: AttendanceAutomationLayoutProps) {
  await requireCanManageEmployees();

  const alertCenter =
    await getAttendanceAutomationAlertCenterData();

  return (
    <div className="space-y-5">
      <AttendanceAutomationSubnav
        alertCount={
          alertCenter.summary.totalAlerts
        }
        alertStatus={
          alertCenter.overallStatus
        }
      />

      {children}
    </div>
  );
}