import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canManageNotices } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import type {
  NoticeListItem,
  NoticePageData,
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

function mapNotice(notice: {
  noticeId: number;
  title: string;
  body: string;
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
}): NoticeListItem {
  return {
    noticeId: notice.noticeId,
    title: notice.title,
    body: notice.body,
    branchName: dash(notice.branch?.name),
    departmentName: dash(notice.department?.name),
    status: notice.status,
    publishedAt: formatDateTime(notice.publishedAt),
    expiresAt: formatDateTime(notice.expiresAt),
    createdBy: notice.createdBy?.username ?? "—",
    createdAt: formatDateTime(notice.createdAt),
    updatedAt: formatDateTime(notice.updatedAt),
  };
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

export async function getNoticePageData(): Promise<NoticePageData> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      canManage: false,
      branchOptions: [],
      departmentOptions: [],
      notices: [],
      summary: {
        total: 0,
        draft: 0,
        published: 0,
        archived: 0,
      },
    };
  }

  const canManage = canManageNotices(session.role);
  const employeeTarget = await getCurrentEmployeeTarget(session.userId);

  const where: Prisma.NoticeWhereInput = canManage
    ? {}
    : buildVisibleNoticeWhere(employeeTarget);

  const [
    branchOptions,
    departmentOptions,
    notices,
    total,
    draft,
    published,
    archived,
  ] = await Promise.all([
    canManage
      ? prisma.branch.findMany({
          select: {
            branchId: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        })
      : [],

    canManage
      ? prisma.department.findMany({
          select: {
            departmentId: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        })
      : [],

    prisma.notice.findMany({
      where,
      select: {
        noticeId: true,
        title: true,
        body: true,
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
      },
      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 100,
    }),

    prisma.notice.count({
      where,
    }),

    prisma.notice.count({
      where: {
        ...where,
        status: "DRAFT",
      },
    }),

    prisma.notice.count({
      where: {
        ...where,
        status: "PUBLISHED",
      },
    }),

    prisma.notice.count({
      where: {
        ...where,
        status: "ARCHIVED",
      },
    }),
  ]);

  return {
    canManage,
    branchOptions: branchOptions.map((branch) => ({
      id: branch.branchId,
      name: branch.name,
    })),
    departmentOptions: departmentOptions.map((department) => ({
      id: department.departmentId,
      name: department.name,
    })),
    notices: notices.map(mapNotice),
    summary: {
      total,
      draft,
      published,
      archived,
    },
  };
}