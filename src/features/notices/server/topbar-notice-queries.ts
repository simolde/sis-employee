import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { SystemRole } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import type { NoticeAudienceValue } from "../types/notice-types";
import type {
  TopbarNoticeItem,
  TopbarNoticeResponse,
} from "../types/topbar-notice-types";

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

function bodyPreview(value: string): string {
  if (value.length <= 120) {
    return value;
  }

  return `${value.slice(0, 120).trim()}...`;
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

function buildTopbarNoticeWhere(input: {
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

function mapTopbarNotice(notice: {
  noticeId: number;
  title: string;
  body: string;
  audience: NoticeAudienceValue;
  publishedAt: Date | null;
  expiresAt: Date | null;
  branch: {
    name: string;
  } | null;
  department: {
    name: string;
  } | null;
  reads: {
    noticeReadId: number;
  }[];
}): TopbarNoticeItem {
  return {
    noticeId: notice.noticeId,
    title: notice.title,
    bodyPreview: bodyPreview(notice.body),
    audience: notice.audience,
    branchName: dash(notice.branch?.name),
    departmentName: dash(notice.department?.name),
    publishedAt: formatDateTime(notice.publishedAt),
    expiresAt: formatDateTime(notice.expiresAt),
    isRead: notice.reads.length > 0,
  };
}

export async function getTopbarNoticeData(): Promise<TopbarNoticeResponse> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      ok: false,
      unreadCount: 0,
      notices: [],
    };
  }

  const employeeTarget = await getCurrentEmployeeTarget(session.userId);

  const visibleWhere = buildTopbarNoticeWhere({
    role: session.role,
    branchId: employeeTarget.branchId,
    departmentId: employeeTarget.departmentId,
  });

  const [notices, unreadCount] = await Promise.all([
    prisma.notice.findMany({
      where: visibleWhere,
      select: {
        noticeId: true,
        title: true,
        body: true,
        audience: true,
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
          where: {
            userId: session.userId,
          },
          select: {
            noticeReadId: true,
          },
          take: 1,
        },
      },
      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          noticeId: "desc",
        },
      ],
      take: 5,
    }),

    prisma.notice.count({
      where: {
        AND: [
          visibleWhere,
          {
            reads: {
              none: {
                userId: session.userId,
              },
            },
          },
        ],
      },
    }),
  ]);

  return {
    ok: true,
    unreadCount,
    notices: notices.map(mapTopbarNotice),
  };
}

export async function markTopbarNoticesAsRead(
  noticeIds: number[],
): Promise<number> {
  const session = await getCurrentSession();

  if (!session || noticeIds.length === 0) {
    return 0;
  }

  const employeeTarget = await getCurrentEmployeeTarget(session.userId);

  const visibleWhere = buildTopbarNoticeWhere({
    role: session.role,
    branchId: employeeTarget.branchId,
    departmentId: employeeTarget.departmentId,
  });

  const uniqueNoticeIds = [...new Set(noticeIds)].filter(
    (noticeId) => Number.isInteger(noticeId) && noticeId > 0,
  );

  if (uniqueNoticeIds.length === 0) {
    return 0;
  }

  const visibleNotices = await prisma.notice.findMany({
    where: {
      AND: [
        visibleWhere,
        {
          noticeId: {
            in: uniqueNoticeIds,
          },
        },
      ],
    },
    select: {
      noticeId: true,
    },
  });

  if (visibleNotices.length > 0) {
    await prisma.$transaction(
      visibleNotices.map((notice) =>
        prisma.noticeRead.upsert({
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
        }),
      ),
    );
  }

  return prisma.notice.count({
    where: {
      AND: [
        visibleWhere,
        {
          reads: {
            none: {
              userId: session.userId,
            },
          },
        },
      ],
    },
  });
}