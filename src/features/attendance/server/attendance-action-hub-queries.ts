import { AttendanceSource } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { buildAttendanceReviewRequiredWhere } from "./attendance-review-policy";
import type { AttendanceActionHubStats } from "../types/attendance-action-hub-types";

function getManilaTodayRange(): {
  start: Date;
  end: Date;
} {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const end = new Date(start);

  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start,
    end,
  };
}

export async function getAttendanceActionHubStats(): Promise<AttendanceActionHubStats> {
  const today = getManilaTodayRange();

  const todayWhere = {
    attDate: {
      gte: today.start,
      lt: today.end,
    },
  };

  const reviewRequiredWhere = buildAttendanceReviewRequiredWhere();

  const [
    totalToday,
    onTimeToday,
    lateToday,
    halfDayToday,
    absentToday,
    missingTimeout,
    manualToday,
    webToday,
    pendingReview,
    openReview,
    verifiedNotApproved,
    attendanceAuditLogs,
    absentTotal,
    automaticAbsent,
    manualAbsent,
    generatedAbsentAuditLogs,
    rollbackEligibleAbsent,
    absentRollbackAuditLogs,
  ] = await Promise.all([
    prisma.attendance.count({
      where: todayWhere,
    }),

    prisma.attendance.count({
      where: {
        ...todayWhere,
        status: "ON_TIME",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayWhere,
        status: "LATE",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayWhere,
        status: "HALF_DAY",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayWhere,
        status: "ABSENT",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "MISSING_TIMEOUT",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayWhere,
        isManual: true,
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayWhere,
        OR: [
          {
            inSource: AttendanceSource.WEB,
          },
          {
            outSource: AttendanceSource.WEB,
          },
        ],
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
          reviewRequiredWhere,
          {
            approvedAt: null,
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        verifiedAt: {
          not: null,
        },
        approvedAt: null,
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
        isManual: false,
      },
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
        isManual: true,
      },
    }),

    prisma.activityLog.count({
      where: {
        action: "ATTENDANCE_ABSENT_AUTO_GENERATED",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
        isManual: false,
        timeIn: null,
        timeOut: null,
      },
    }),

    prisma.activityLog.count({
      where: {
        action: "ATTENDANCE_ABSENT_AUTO_ROLLED_BACK",
      },
    }),
  ]);

  return {
    totalToday,
    onTimeToday,
    lateToday,
    halfDayToday,
    absentToday,
    missingTimeout,
    manualToday,
    webToday,
    pendingReview,
    openReview,
    verifiedNotApproved,
    attendanceAuditLogs,
    absentTotal,
    automaticAbsent,
    manualAbsent,
    generatedAbsentAuditLogs,
    rollbackEligibleAbsent,
    absentRollbackAuditLogs,
  };
}