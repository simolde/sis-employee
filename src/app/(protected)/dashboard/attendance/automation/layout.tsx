import type { ReactNode } from "react";
import { AttendanceAutomationSubnav } from "@/features/attendance/automation/components/attendance-automation-subnav";

type AttendanceAutomationLayoutProps = {
  children: ReactNode;
};

export default function AttendanceAutomationLayout({
  children,
}: AttendanceAutomationLayoutProps) {
  return (
    <div className="space-y-4">
      <AttendanceAutomationSubnav />

      {children}
    </div>
  );
}