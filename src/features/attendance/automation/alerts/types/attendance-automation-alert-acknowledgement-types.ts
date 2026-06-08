import type {
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertItem,
} from "./attendance-automation-alert-types";

export const ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED_ACTION =
  "ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED";

export const ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION =
  "ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED";

export const ATTENDANCE_AUTOMATION_ALERT_ENTITY_TYPE =
  "attendance_automation_alert";

export type AttendanceAutomationAlertAcknowledgement = {
  activityLogId: number;
  alertCode: AttendanceAutomationAlertCode;

  actorUserId: number | null;

  acknowledgedAt: string;
  acknowledgedAtIso: string;

  acknowledgedUntil: string;
  acknowledgedUntilIso: string;

  durationHours: number;
  remainingMinutes: number;

  note: string | null;
};

export type AttendanceAutomationAlertViewItem =
  AttendanceAutomationAlertItem & {
    acknowledgement:
      AttendanceAutomationAlertAcknowledgement | null;
  };