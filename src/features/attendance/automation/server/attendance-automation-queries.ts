import { prisma } from "@/lib/db/prisma";
import { buildAttendanceReviewRequiredWhere } from "@/features/attendance/server/attendance-review-policy";
import { buildEligibleMissingTimeoutWhere } from "@/features/attendance/missing-timeouts/server/missing-timeout-service";
import type { AttendanceAutomationStatus } from "../types/attendance-automation-action-types";

function getCronActorEmail(): string {
  return (
    process.env.MISSING_TIMEOUT_CRON_ACTOR_EMAIL ??
    process.env.SEED_ADMIN_EMAIL ??
    ""
  ).trim();
}

export async function getAttendanceAutomationStatus(): Promise<AttendanceAutomationStatus> {
  const cronActorEmail = getCronActorEmail();
  const cronSecretConfigured = Boolean(
    process.env.MISSING_TIMEOUT_CRON_SECRET?.trim(),
  );

  const reviewRequiredWhere = buildAttendanceReviewRequiredWhere();
  const eligibleMissingTimeoutWhere = buildEligibleMissingTimeoutWhere();

  const [actorUser, eligibleMissingTimeouts, markedMissingTimeouts, openReviewRecords] =
    await Promise.all([
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
  };
}