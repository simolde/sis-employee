import type {
  AttendanceAutomationAlertCenterData,
  AttendanceAutomationAlertItem,
  AttendanceAutomationAlertOverallStatus,
} from "./attendance-automation-alert-types";

export type AttendanceAutomationAlertApiData = {
  generatedAt: string;

  summary:
    AttendanceAutomationAlertCenterData["summary"];

  signals:
    AttendanceAutomationAlertCenterData["signals"];

  alerts: AttendanceAutomationAlertItem[];
};

export type AttendanceAutomationAlertApiResponse = {
  ok: boolean;
  requiresAttention: boolean;

  checkedAt: string;

  status:
    AttendanceAutomationAlertOverallStatus;

  message: string;

  data: AttendanceAutomationAlertApiData;
};