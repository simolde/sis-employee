export type AttendanceAutomationStatus = {
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
};