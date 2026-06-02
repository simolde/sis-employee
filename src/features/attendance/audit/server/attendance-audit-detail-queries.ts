import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export type AttendanceAuditDetail = {
  activityLogId: number;
  actorUserId: number | null;
  actorName: string;
  actorEmail: string;
  actorStatus: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
};

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function safeJsonString(value: Prisma.JsonValue | null): string {
  if (value === null) {
    return "—";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Unable to display audit JSON.";
  }
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

export async function getAttendanceAuditDetail(
  activityLogId: string,
): Promise<AttendanceAuditDetail | null> {
  const parsedActivityLogId = parsePositiveId(activityLogId);

  if (!parsedActivityLogId) {
    return null;
  }

  const auditLog = await prisma.activityLog.findFirst({
    where: {
      activityLogId: parsedActivityLogId,
      entityType: "attendance",
    },
    select: {
      activityLogId: true,
      actorUserId: true,
      action: true,
      entityType: true,
      entityId: true,
      oldValue: true,
      newValue: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
    },
  });

  if (!auditLog) {
    return null;
  }

  const actorUser = auditLog.actorUserId
    ? await prisma.user.findUnique({
        where: {
          userId: auditLog.actorUserId,
        },
        select: {
          username: true,
          email: true,
          status: true,
        },
      })
    : null;

  return {
    activityLogId: auditLog.activityLogId,
    actorUserId: auditLog.actorUserId,
    actorName: actorUser?.username ?? (auditLog.actorUserId ? "Unknown User" : "System"),
    actorEmail: actorUser?.email ?? "—",
    actorStatus: actorUser?.status ?? "—",
    action: auditLog.action,
    entityType: auditLog.entityType,
    entityId: auditLog.entityId ?? "—",
    oldValue: safeJsonString(auditLog.oldValue),
    newValue: safeJsonString(auditLog.newValue),
    ipAddress: auditLog.ipAddress ?? "—",
    userAgent: auditLog.userAgent ?? "—",
    createdAt: formatDateTime(auditLog.createdAt),
  };
}