import type {
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertSeverity,
} from "../../types/attendance-automation-alert-types";

export type AttendanceAutomationAcknowledgementHistoryAction =
  | "ACKNOWLEDGED"
  | "CLEARED";

export type AttendanceAutomationAcknowledgementHistoryActionFilter =
  | ""
  | AttendanceAutomationAcknowledgementHistoryAction;

export type AttendanceAutomationAcknowledgementHistoryStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CLEARED"
  | "SUPERSEDED";

export type AttendanceAutomationAcknowledgementHistoryStatusFilter =
  | ""
  | AttendanceAutomationAcknowledgementHistoryStatus;

export type AttendanceAutomationAcknowledgementHistoryFilters = {
  q: string;
  action: AttendanceAutomationAcknowledgementHistoryActionFilter;
  status: AttendanceAutomationAcknowledgementHistoryStatusFilter;

  dateFrom: string;
  dateTo: string;

  page: number;
  pageSize: number;
};

export type AttendanceAutomationAcknowledgementHistoryRecord = {
  activityLogId: number;

  alertCode:
    AttendanceAutomationAlertCode | string;

  alertTitle: string;
  alertSeverity:
    AttendanceAutomationAlertSeverity | "UNKNOWN";

  action:
    AttendanceAutomationAcknowledgementHistoryAction;

  status:
    AttendanceAutomationAcknowledgementHistoryStatus;

  actorUserId: number | null;

  note: string | null;
  durationHours: number | null;

  acknowledgedAt: string | null;
  acknowledgedAtIso: string | null;

  acknowledgedUntil: string | null;
  acknowledgedUntilIso: string | null;

  clearedAt: string | null;
  clearedAtIso: string | null;

  createdAt: string;
  createdAtIso: string;
};

export type AttendanceAutomationAcknowledgementHistoryData = {
  filters:
    AttendanceAutomationAcknowledgementHistoryFilters;

  records:
    AttendanceAutomationAcknowledgementHistoryRecord[];

  summary: {
    totalMatchingRecords: number;
    acknowledgementEvents: number;
    clearingEvents: number;

    activeAcknowledgements: number;
    expiredAcknowledgements: number;
    clearedAcknowledgements: number;
    supersededAcknowledgements: number;
  };

  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };

  metadata: {
    scannedRecords: number;
    maximumScannedRecords: number;
    isPartial: boolean;
  };
};