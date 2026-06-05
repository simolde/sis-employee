import { getApprovedLeaveExcusedSyncData } from "./approved-leave-excused-sync-queries";
import type { ApprovedLeaveExcusedSyncFilters } from "../types/approved-leave-excused-sync-types";

export type ApprovedLeaveExcusedSyncOverview = {
  dateFrom: string;
  dateTo: string;
  matchingApprovedLeaves: number;
  evaluatedLeaveDates: number;
  missingExcusedCandidates: number;
  alreadyHasAttendance: number;
  notScheduled: number;
  exceptionProtected: number;
};

function getManilaDateInputValue(
  offsetDays = 0,
): string {
  const now = new Date();

  const targetDate = new Date(
    now.getTime() +
      offsetDays * 24 * 60 * 60 * 1000,
  );

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);

  const year =
    parts.find((part) => part.type === "year")
      ?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")
      ?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")
      ?.value ?? "";

  return `${year}-${month}-${day}`;
}

export async function getApprovedLeaveExcusedSyncOverview(): Promise<ApprovedLeaveExcusedSyncOverview> {
  const filters: ApprovedLeaveExcusedSyncFilters = {
    q: "",
    branchId: "",
    departmentId: "",
    dateFrom: getManilaDateInputValue(-30),
    dateTo: getManilaDateInputValue(30),
    page: 1,
    pageSize: 1,
  };

  const result =
    await getApprovedLeaveExcusedSyncData(filters);

  return {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    matchingApprovedLeaves:
      result.summary.matchingApprovedLeaves,
    evaluatedLeaveDates:
      result.summary.evaluatedLeaveDates,
    missingExcusedCandidates:
      result.summary.missingExcusedCandidates,
    alreadyHasAttendance:
      result.summary.alreadyHasAttendance,
    notScheduled:
      result.summary.notScheduled,
    exceptionProtected:
      result.summary.exceptionProtected,
  };
}