import { AttendanceSource } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AttendanceActionHubStats } from "../types/attendance-action-hub-types";
import { buildAttendanceReviewRequiredWhere } from "./attendance-review-policy";

const exceptionAuditActions = [
  "ATTENDANCE_EXCEPTION_CREATED",
  "ATTENDANCE_EXCEPTION_UPDATED",
  "ATTENDANCE_EXCEPTION_ARCHIVED",
] as const;

function getManilaTodayRange(): {
  start: Date;
  end: Date;
} {
  const now = new Date();

  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(now);

  const year = Number(
    parts.find(
      (part) => part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) => part.type === "month",
    )?.value,
  );

  const day = Number(
    parts.find(
      (part) => part.type === "day",
    )?.value,
  );

  const start = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      0,
      0,
      0,
      0,
    ),
  );

  const end = new Date(start);

  end.setUTCDate(
    end.getUTCDate() + 1,
  );

  return {
    start,
    end,
  };
}

export async function getAttendanceActionHubStats(): Promise<AttendanceActionHubStats> {
  const today = getManilaTodayRange();

  const todayAttendanceWhere = {
    attDate: {
      gte: today.start,
      lt: today.end,
    },
  };

  const todayExceptionWhere = {
    exceptionDate: {
      gte: today.start,
      lt: today.end,
    },
  };

  const reviewRequiredWhere =
    buildAttendanceReviewRequiredWhere();

  const [
    totalToday,
    onTimeToday,
    lateToday,
    halfDayToday,
    absentToday,
    excusedToday,
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
    excusedTotal,
    automaticExcused,
    manualExcused,
    generatedExcusedAuditLogs,
    activeAttendanceExceptions,
    absenceBlockingExceptions,
    todayBlockingExceptions,
    exceptionAuditLogs,
    exceptionCreatedAuditLogs,
    exceptionUpdatedAuditLogs,
    exceptionArchivedAuditLogs,
  ] = await Promise.all([
    prisma.attendance.count({
      where: todayAttendanceWhere,
    }),

    prisma.attendance.count({
      where: {
        ...todayAttendanceWhere,
        status: "ON_TIME",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayAttendanceWhere,
        status: "LATE",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayAttendanceWhere,
        status: "HALF_DAY",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayAttendanceWhere,
        status: "ABSENT",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayAttendanceWhere,
        status: "EXCUSED",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "MISSING_TIMEOUT",
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayAttendanceWhere,
        isManual: true,
      },
    }),

    prisma.attendance.count({
      where: {
        ...todayAttendanceWhere,
        OR: [
          {
            inSource:
              AttendanceSource.WEB,
          },
          {
            outSource:
              AttendanceSource.WEB,
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
        action:
          "ATTENDANCE_ABSENT_AUTO_GENERATED",
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
        action:
          "ATTENDANCE_ABSENT_AUTO_ROLLED_BACK",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "EXCUSED",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "EXCUSED",
        isManual: false,
      },
    }),

    prisma.attendance.count({
      where: {
        status: "EXCUSED",
        isManual: true,
      },
    }),

    prisma.activityLog.count({
      where: {
        action:
          "ATTENDANCE_EXCUSED_AUTO_GENERATED",
      },
    }),

    prisma.attendanceExceptionDate.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.attendanceExceptionDate.count({
      where: {
        status: "ACTIVE",
        affectsAbsenceGeneration: true,
      },
    }),

    prisma.attendanceExceptionDate.count({
      where: {
        ...todayExceptionWhere,
        status: "ACTIVE",
        affectsAbsenceGeneration: true,
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType:
          "attendance_exception",
        action: {
          in: [...exceptionAuditActions],
        },
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType:
          "attendance_exception",
        action:
          "ATTENDANCE_EXCEPTION_CREATED",
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType:
          "attendance_exception",
        action:
          "ATTENDANCE_EXCEPTION_UPDATED",
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType:
          "attendance_exception",
        action:
          "ATTENDANCE_EXCEPTION_ARCHIVED",
      },
    }),
  ]);

  return {
    totalToday,
    onTimeToday,
    lateToday,
    halfDayToday,
    absentToday,
    excusedToday,
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
    excusedTotal,
    automaticExcused,
    manualExcused,
    generatedExcusedAuditLogs,
    activeAttendanceExceptions,
    absenceBlockingExceptions,
    todayBlockingExceptions,
    exceptionAuditLogs,
    exceptionCreatedAuditLogs,
    exceptionUpdatedAuditLogs,
    exceptionArchivedAuditLogs,
  };
}