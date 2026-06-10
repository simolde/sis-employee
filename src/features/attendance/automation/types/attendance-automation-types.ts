export type AttendanceAutomationStatus = {
  autoMarkMissingTimeout: boolean;
  missingTimeoutMinutes: number;

  cronSecretConfigured: boolean;
  cronActorEmail: string;
  cronActorFound: boolean;
  cronActorUsername: string;
  cronActorStatus: string;

  eligibleMissingTimeouts: number;
  markedMissingTimeouts: number;
  openReviewRecords: number;

  endpointPath: string;
  recommendedSchedule: string;
  batchLimit: number;

  attendanceStatusCronSecretConfigured: boolean;
  attendanceStatusCronActorEmail: string;
  attendanceStatusCronActorFound: boolean;
  attendanceStatusCronActorUsername: string;
  attendanceStatusCronActorStatus: string;

  attendanceStatusEndpointPath: string;
  attendanceStatusBatchLimit: number;
  attendanceStatusNormalRecords: number;
  attendanceStatusNormalRecordsWithSchedule: number;
};