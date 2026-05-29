import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canManageNotices } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  NoticeAudienceValue,
  NoticeReadReportData,
  NoticeReadReportItem,
  NoticeStatusValue,
} from "../types/notice-types";

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
    timeZone: "Asia/Manila",
  }).format(date);
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "All";
}

function getAudienceRoleNames(
  audience: NoticeAudienceValue,
): string[] | undefined {
  if (audience === "ALL") {
    return undefined;
  }

  if (audience === "HR_ADMIN") {
    return ["SUPER_ADMIN", "HR", "ADMIN"];
  }

  if (audience === "HEADS") {
    return ["HEAD"];
  }

  return ["STAFF", "FACULTY", "MAINTENANCE"];
}

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function buildRecipientWhere(input: {
  audience: NoticeAudienceValue;
  branchId: number | null;
  departmentId: number | null;
}): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {
    status: "ACTIVE",
  };

  const roleNames = getAudienceRoleNames(input.audience);

  if (roleNames) {
    where.role = {
      name: {
        in: roleNames,
      },
    };
  }

  if (input.branchId || input.departmentId) {
    where.employee = {
      ...(input.branchId
        ? {
            branchId: input.branchId,
          }
        : {}),
      ...(input.departmentId
        ? {
            departmentId: input.departmentId,
          }
        : {}),
    };
  }

  return where;
}

function mapReadReportItem(input: {
  user: {
    userId: number;
    username: string;
    email: string;
    role: {
      name: string;
    };
    employee: {
      firstName: string;
      middleName: string | null;
      lastName: string;
      branch: {
        name: string;
      } | null;
      department: {
        name: string;
      } | null;
    } | null;
  };
  readAt: Date | null;
}): NoticeReadReportItem {
  return {
    userId: input.user.userId,
    username: input.user.username,
    email: input.user.email,
    employeeName: input.user.employee
      ? formatFullName({
          firstName: input.user.employee.firstName,
          middleName: input.user.employee.middleName,
          lastName: input.user.employee.lastName,
        })
      : "No linked employee profile",
    roleName: input.user.role.name,
    branchName: input.user.employee?.branch?.name ?? "—",
    departmentName: input.user.employee?.department?.name ?? "—",
    hasRead: Boolean(input.readAt),
    readAt: formatDateTime(input.readAt),
  };
}

export async function getNoticeReadReportData(
  noticeId: string,
): Promise<NoticeReadReportData | null> {
  const session = await getCurrentSession();

  if (!session || !canManageNotices(session.role)) {
    return null;
  }

  const parsedNoticeId = parsePositiveId(noticeId);

  if (!parsedNoticeId) {
    return null;
  }

  const notice = await prisma.notice.findUnique({
    where: {
      noticeId: parsedNoticeId,
    },
    select: {
      noticeId: true,
      title: true,
      audience: true,
      branchId: true,
      departmentId: true,
      status: true,
      publishedAt: true,
      expiresAt: true,
      branch: {
        select: {
          name: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
      reads: {
        select: {
          userId: true,
          readAt: true,
        },
      },
    },
  });

  if (!notice) {
    return null;
  }

  const users = await prisma.user.findMany({
    where: buildRecipientWhere({
      audience: notice.audience,
      branchId: notice.branchId,
      departmentId: notice.departmentId,
    }),
    select: {
      userId: true,
      username: true,
      email: true,
      role: {
        select: {
          name: true,
        },
      },
      employee: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          branch: {
            select: {
              name: true,
            },
          },
          department: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        role: {
          name: "asc",
        },
      },
      {
        username: "asc",
      },
    ],
  });

  const readMap = new Map(
    notice.reads.map((read) => [read.userId, read.readAt] as const),
  );

  const recipients = users.map((user) =>
    mapReadReportItem({
      user,
      readAt: readMap.get(user.userId) ?? null,
    }),
  );

  const totalRecipients = recipients.length;
  const totalRead = recipients.filter((recipient) => recipient.hasRead).length;
  const totalUnread = totalRecipients - totalRead;
  const readPercentage =
    totalRecipients > 0 ? Math.round((totalRead / totalRecipients) * 100) : 0;

  return {
    notice: {
      noticeId: notice.noticeId,
      title: notice.title,
      audience: notice.audience,
      branchName: dash(notice.branch?.name),
      departmentName: dash(notice.department?.name),
      status: notice.status as NoticeStatusValue,
      publishedAt: formatDateTime(notice.publishedAt),
      expiresAt: formatDateTime(notice.expiresAt),
    },
    recipients,
    summary: {
      totalRecipients,
      totalRead,
      totalUnread,
      readPercentage,
    },
  };
}