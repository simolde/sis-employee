import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canManageNotices, type SystemRole } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import type {
  NoticeAudienceValue,
  NoticeDetailData,
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

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getAllowedAudiences(role: SystemRole): NoticeAudienceValue[] {
  if (["SUPER_ADMIN", "HR", "ADMIN"].includes(role)) {
    return ["ALL", "HR_ADMIN"];
  }

  if (role === "HEAD") {
    return ["ALL", "HEADS"];
  }

  return ["ALL", "STAFF_FACULTY_MAINTENANCE"];
}

async function getCurrentEmployeeTarget(userId: number): Promise<{
  branchId: number | null;
  departmentId: number | null;
}> {
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      employee: {
        select: {
          branchId: true,
          departmentId: true,
        },
      },
    },
  });

  return {
    branchId: user?.employee?.branchId ?? null,
    departmentId: user?.employee?.departmentId ?? null,
  };
}

function buildVisibleNoticeWhere(input: {
  noticeId: number;
  role: SystemRole;
  branchId: number | null;
  departmentId: number | null;
}): Prisma.NoticeWhereInput {
  const branchTarget: Prisma.NoticeWhereInput[] = [
    {
      branchId: null,
    },
  ];

  const departmentTarget: Prisma.NoticeWhereInput[] = [
    {
      departmentId: null,
    },
  ];

  if (input.branchId) {
    branchTarget.push({
      branchId: input.branchId,
    });
  }

  if (input.departmentId) {
    departmentTarget.push({
      departmentId: input.departmentId,
    });
  }

  return {
    noticeId: input.noticeId,
    status: "PUBLISHED",
    audience: {
      in: getAllowedAudiences(input.role),
    },
    AND: [
      {
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gte: new Date(),
            },
          },
        ],
      },
      {
        OR: branchTarget,
      },
      {
        OR: departmentTarget,
      },
    ],
  };
}

function mapNoticeDetail(input: {
  notice: {
    noticeId: number;
    title: string;
    body: string;
    audience: NoticeAudienceValue;
    status: NoticeStatusValue;
    publishedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    branch: {
      name: string;
    } | null;
    department: {
      name: string;
    } | null;
    createdBy: {
      username: string;
    } | null;
    updatedBy: {
      username: string;
    } | null;
    reads: {
      noticeReadId: number;
    }[];
  };
  canManage: boolean;
}): NoticeDetailData {
  return {
    noticeId: input.notice.noticeId,
    title: input.notice.title,
    body: input.notice.body,
    audience: input.notice.audience,
    branchName: dash(input.notice.branch?.name),
    departmentName: dash(input.notice.department?.name),
    status: input.notice.status,
    publishedAt: formatDateTime(input.notice.publishedAt),
    expiresAt: formatDateTime(input.notice.expiresAt),
    createdBy: input.notice.createdBy?.username ?? "—",
    updatedBy: input.notice.updatedBy?.username ?? "—",
    createdAt: formatDateTime(input.notice.createdAt),
    updatedAt: formatDateTime(input.notice.updatedAt),
    canManage: input.canManage,
    isRead: input.notice.reads.length > 0,
  };
}

export async function getNoticeDetailData(
  noticeId: string,
): Promise<NoticeDetailData | null> {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const parsedNoticeId = parsePositiveId(noticeId);

  if (!parsedNoticeId) {
    return null;
  }

  const canManage = canManageNotices(session.role);
  const employeeTarget = await getCurrentEmployeeTarget(session.userId);

  const where: Prisma.NoticeWhereInput = canManage
    ? {
        noticeId: parsedNoticeId,
      }
    : buildVisibleNoticeWhere({
        noticeId: parsedNoticeId,
        role: session.role,
        branchId: employeeTarget.branchId,
        departmentId: employeeTarget.departmentId,
      });

  const notice = await prisma.notice.findFirst({
    where,
    select: {
      noticeId: true,
      title: true,
      body: true,
      audience: true,
      status: true,
      publishedAt: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
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
      createdBy: {
        select: {
          username: true,
        },
      },
      updatedBy: {
        select: {
          username: true,
        },
      },
      reads: {
        where: {
          userId: session.userId,
        },
        select: {
          noticeReadId: true,
        },
        take: 1,
      },
    },
  });

  if (!notice) {
    return null;
  }

  if (notice.status === "PUBLISHED" && notice.reads.length === 0) {
    await prisma.noticeRead.upsert({
      where: {
        noticeId_userId: {
          noticeId: notice.noticeId,
          userId: session.userId,
        },
      },
      create: {
        noticeId: notice.noticeId,
        userId: session.userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    return mapNoticeDetail({
      notice: {
        ...notice,
        reads: [
          {
            noticeReadId: 1,
          },
        ],
      },
      canManage,
    });
  }

  return mapNoticeDetail({
    notice,
    canManage,
  });
}