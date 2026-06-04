import { prisma } from "@/lib/db/prisma";
import { buildAttendanceReviewRequiredWhere } from "@/features/attendance/server/attendance-review-policy";
import { buildEligibleMissingTimeoutWhere } from "@/features/attendance/missing-timeouts/server/missing-timeout-service";
import { getAttendanceStatusRecalculationSummary } from "@/features/attendance/status-recalculation/server/attendance-status-recalculation-service";
import type { AttendanceAutomationStatus } from "../types/attendance-automation-types";

function getMissingTimeoutCronActorEmail(): string {
  return (
    process.env.MISSING_TIMEOUT_CRON_ACTOR_EMAIL ??
    process.env.SEED_ADMIN_EMAIL ??
    ""
  ).trim();
}

function getAttendanceStatusCronActorEmail(): string {
  return (
    process.env.ATTENDANCE_STATUS_CRON_ACTOR_EMAIL ??
    process.env.MISSING_TIMEOUT_CRON_ACTOR_EMAIL ??
    process.env.SEED_ADMIN_EMAIL ??
    ""
  ).trim();
}

export async function getAttendanceAutomationStatus(): Promise<AttendanceAutomationStatus> {
  const cronActorEmail = getMissingTimeoutCronActorEmail();
  const attendanceStatusCronActorEmail = getAttendanceStatusCronActorEmail();

  const cronSecretConfigured = Boolean(
    process.env.MISSING_TIMEOUT_CRON_SECRET?.trim(),
  );

  const attendanceStatusCronSecretConfigured = Boolean(
    (
      process.env.ATTENDANCE_STATUS_CRON_SECRET ??
      process.env.MISSING_TIMEOUT_CRON_SECRET
    )?.trim(),
  );

  const reviewRequiredWhere = buildAttendanceReviewRequiredWhere();
  const eligibleMissingTimeoutWhere = buildEligibleMissingTimeoutWhere();

  const [
    actorUser,
    attendanceStatusActorUser,
    eligibleMissingTimeouts,
    markedMissingTimeouts,
    openReviewRecords,
    attendanceStatusSummary,
  ] = await Promise.all([
    cronActorEmail
      ? prisma.user.findUnique({
          where: {
            email: cronActorEmail,
          },
          select: {
            username: true,
            status: true,
          },
        })
      : null,

    attendanceStatusCronActorEmail
      ? prisma.user.findUnique({
          where: {
            email: attendanceStatusCronActorEmail,
          },
          select: {
            username: true,
            status: true,
          },
        })
      : null,

    prisma.attendance.count({
      where: eligibleMissingTimeoutWhere,
    }),

    prisma.attendance.count({
      where: {
        status: "MISSING_TIMEOUT",
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

    getAttendanceStatusRecalculationSummary(),
  ]);

  return {
    cronSecretConfigured,
    cronActorEmail: cronActorEmail || "Not configured",
    cronActorFound: Boolean(actorUser),
    cronActorUsername: actorUser?.username ?? "—",
    cronActorStatus: actorUser?.status ?? "—",
    eligibleMissingTimeouts,
    markedMissingTimeouts,
    openReviewRecords,
    endpointPath: "/api/cron/mark-missing-timeouts",
    recommendedSchedule: "Every 1 hour",
    batchLimit: 200,

    attendanceStatusCronSecretConfigured,
    attendanceStatusCronActorEmail:
      attendanceStatusCronActorEmail || "Not configured",
    attendanceStatusCronActorFound: Boolean(attendanceStatusActorUser),
    attendanceStatusCronActorUsername:
      attendanceStatusActorUser?.username ?? "—",
    attendanceStatusCronActorStatus: attendanceStatusActorUser?.status ?? "—",
    attendanceStatusEndpointPath:
      "/api/cron/recalculate-attendance-statuses",
    attendanceStatusBatchLimit: 300,
    attendanceStatusNormalRecords: attendanceStatusSummary.totalNormalRecords,
    attendanceStatusNormalRecordsWithSchedule:
      attendanceStatusSummary.normalRecordsWithSchedule,
  };
}