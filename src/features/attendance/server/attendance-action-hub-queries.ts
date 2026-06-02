import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { buildAttendanceReviewRequiredWhere } from "./attendance-review-policy";

export type AttendanceActionHubStats = {
  totalToday: number;
  onTimeToday: number;
  lateToday: number;
  missingTimeout: number;
  pendingReview: number;
  manualToday: number;
  webToday: number;
  rfidToday: number;
  openReview: number;
  verifiedNotApproved: number;
  approvedReview: number;
  totalReviewRequired: number;
  attendanceAuditLogs: number;
};

type AttendanceHubSource = "WEB" | "RFID";

function getManilaDateOnly(date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function sourceWhere(source: AttendanceHubSource): Prisma.AttendanceWhereInput {
  return {
    OR: [
      {
        inSource: source,
      },
      {
        outSource: source,
      },
    ],
  };
}

export async function getAttendanceActionHubStats(): Promise<AttendanceActionHubStats> {
  const today = getManilaDateOnly();
  const reviewRequiredWhere = buildAttendanceReviewRequiredWhere();

  const [
    totalToday,
    onTimeToday,
    lateToday,
    missingTimeout,
    pendingReview,
    manualToday,
    webToday,
    rfidToday,
    openReview,
    verifiedNotApproved,
    approvedReview,
    totalReviewRequired,
    attendanceAuditLogs,
  ] = await Promise.all([
    prisma.attendance.count({
      where: {
        attDate: today,
      },
    }),

    prisma.attendance.count({
      where: {
        attDate: today,
        status: "ON_TIME",
      },
    }),

    prisma.attendance.count({
      where: {
        attDate: today,
        status: "LATE",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "MISSING_TIMEOUT",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          {
            attDate: today,
          },
          reviewRequiredWhere,
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          {
            attDate: today,
          },
          sourceWhere("WEB"),
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          {
            attDate: today,
          },
          sourceWhere("RFID"),
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          reviewRequiredWhere,
          {
            approvedAt: null,
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          reviewRequiredWhere,
          {
            verifiedAt: {
              not: null,
            },
            approvedAt: null,
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          reviewRequiredWhere,
          {
            approvedAt: {
              not: null,
            },
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: reviewRequiredWhere,
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance",
      },
    }),
  ]);

  return {
    totalToday,
    onTimeToday,
    lateToday,
    missingTimeout,
    pendingReview,
    manualToday,
    webToday,
    rfidToday,
    openReview,
    verifiedNotApproved,
    approvedReview,
    totalReviewRequired,
    attendanceAuditLogs,
  };
}