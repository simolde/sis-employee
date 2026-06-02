import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  AttendanceRecordAuditHeader,
  AttendanceRecordAuditItem,
  AttendanceRecordAuditResult,
} from "../types/attendance-record-audit-types";

type ActorUserMapValue = {
  username: string;
  email: string;
  status: string;
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

function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
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

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function getActorDetails(input: {
  actorUserId: number | null;
  actorUsersById: Map<number, ActorUserMapValue>;
}): ActorUserMapValue {
  if (!input.actorUserId) {
    return {
      username: "System",
      email: "—",
      status: "—",
    };
  }

  return (
    input.actorUsersById.get(input.actorUserId) ?? {
      username: "Unknown User",
      email: "—",
      status: "—",
    }
  );
}

function mapAttendanceHeader(input: {
  attendanceId: number;
  attDate: Date;
  status: string;
  inSource: string | null;
  outSource: string | null;
  employee: {
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    department: {
      name: string;
    } | null;
    branch: {
      name: string;
    };
  };
}): AttendanceRecordAuditHeader {
  return {
    attendanceId: input.attendanceId,
    empNumber: input.employee.empNumber,
    employeeName: formatFullName({
      firstName: input.employee.firstName,
      middleName: input.employee.middleName,
      lastName: input.employee.lastName,
    }),
    departmentName: dash(input.employee.department?.name),
    branchName: input.employee.branch.name,
    attDate: formatDate(input.attDate),
    status: input.status,
    source: input.outSource ?? input.inSource ?? "—",
  };
}

function mapRecordAuditItem(
  input: {
    activityLogId: number;
    actorUserId: number | null;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValue: Prisma.JsonValue | null;
    newValue: Prisma.JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  },
  actorUsersById: Map<number, ActorUserMapValue>,
): AttendanceRecordAuditItem {
  const actor = getActorDetails({
    actorUserId: input.actorUserId,
    actorUsersById,
  });

  return {
    activityLogId: input.activityLogId,
    actorUserId: input.actorUserId,
    actorName: actor.username,
    actorEmail: actor.email,
    actorStatus: actor.status,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? "—",
    oldValue: safeJsonString(input.oldValue),
    newValue: safeJsonString(input.newValue),
    ipAddress: input.ipAddress ?? "—",
    userAgent: input.userAgent ?? "—",
    createdAt: formatDateTime(input.createdAt),
  };
}

function countAction(
  records: {
    action: string;
  }[],
  action: string,
): number {
  if (action === "ATTENDANCE_STATUS_UPDATED") {
    return records.filter((record) =>
      record.action.startsWith("ATTENDANCE_STATUS_UPDATED"),
    ).length;
  }

  return records.filter((record) => record.action === action).length;
}

export async function getAttendanceRecordAuditData(
  attendanceId: string,
): Promise<AttendanceRecordAuditResult | null> {
  const parsedAttendanceId = parsePositiveId(attendanceId);

  if (!parsedAttendanceId) {
    return null;
  }

  const attendance = await prisma.attendance.findUnique({
    where: {
      attendanceId: parsedAttendanceId,
    },
    select: {
      attendanceId: true,
      attDate: true,
      status: true,
      inSource: true,
      outSource: true,
      employee: {
        select: {
          empNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          department: {
            select: {
              name: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!attendance) {
    return null;
  }

  const records = await prisma.activityLog.findMany({
    where: {
      entityType: "attendance",
      entityId: String(parsedAttendanceId),
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
    orderBy: {
      createdAt: "desc",
    },
  });

  const actorUserIds = Array.from(
    new Set(
      records
        .map((record) => record.actorUserId)
        .filter((actorUserId): actorUserId is number => actorUserId !== null),
    ),
  );

  const actorUsers =
    actorUserIds.length > 0
      ? await prisma.user.findMany({
          where: {
            userId: {
              in: actorUserIds,
            },
          },
          select: {
            userId: true,
            username: true,
            email: true,
            status: true,
          },
        })
      : [];

  const actorUsersById = new Map<number, ActorUserMapValue>(
    actorUsers.map((user) => [
      user.userId,
      {
        username: user.username,
        email: user.email,
        status: user.status,
      },
    ]),
  );

  return {
    header: mapAttendanceHeader(attendance),
    records: records.map((record) =>
      mapRecordAuditItem(record, actorUsersById),
    ),
    summary: {
      totalLogs: records.length,
      manualCreated: countAction(records, "MANUAL_ATTENDANCE_CREATED"),
      manualCorrected: countAction(records, "MANUAL_ATTENDANCE_CORRECTED"),
      missingTimeout: countAction(
        records,
        "ATTENDANCE_MARKED_MISSING_TIMEOUT",
      ),
      verified: countAction(records, "ATTENDANCE_VERIFIED"),
      approved: countAction(records, "ATTENDANCE_APPROVED"),
      statusUpdated: countAction(records, "ATTENDANCE_STATUS_UPDATED"),
    },
  };
}