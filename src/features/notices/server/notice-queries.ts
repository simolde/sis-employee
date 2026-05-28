import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canManageNotices, type SystemRole } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import { noticeListSearchParamsSchema } from "../validators/notice-validation";
import type {
  NoticeAudienceFilterValue,
  NoticeAudienceValue,
  NoticeEditData,
  NoticeListItem,
  NoticeListSearchParams,
  NoticePageData,
  NoticeStatusFilterValue,
  NoticeStatusValue,
  NoticeTargetOption,
} from "../types/notice-types";

function getSearchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseNoticeListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): NoticeListSearchParams {
  const parsed = noticeListSearchParamsSchema.parse({
    q: getSearchParamValue(searchParams.q),
    status: getSearchParamValue(searchParams.status),
    audience: getSearchParamValue(searchParams.audience),
    page: getSearchParamValue(searchParams.page),
    pageSize: getSearchParamValue(searchParams.pageSize),
  });

  return {
    q: parsed.q,
    status: parsed.status as NoticeStatusFilterValue,
    audience: parsed.audience as NoticeAudienceFilterValue,
    page: parsed.page,
    pageSize: parsed.pageSize,
  };
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
    timeZone: "Asia/Manila",
  }).format(date);
}

function formatDateTimeLocalInput(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "All";
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

function mapNotice(notice: {
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
}): NoticeListItem {
  return {
    noticeId: notice.noticeId,
    title: notice.title,
    body: notice.body,
    audience: notice.audience,
    branchName: dash(notice.branch?.name),
    departmentName: dash(notice.department?.name),
    status: notice.status,
    publishedAt: formatDateTime(notice.publishedAt),
    expiresAt: formatDateTime(notice.expiresAt),
    createdBy: notice.createdBy?.username ?? "—",
    updatedBy: notice.updatedBy?.username ?? "—",
    createdAt: formatDateTime(notice.createdAt),
    updatedAt: formatDateTime(notice.updatedAt),
  };
}

async function getTargetOptions(): Promise<{
  branchOptions: NoticeTargetOption[];
  departmentOptions: NoticeTargetOption[];
}> {
  const [branches, departments] = await Promise.all([
    prisma.branch.findMany({
      select: {
        branchId: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.department.findMany({
      select: {
        departmentId: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    branchOptions: branches.map((branch) => ({
      id: branch.branchId,
      name: branch.name,
    })),
    departmentOptions: departments.map((department) => ({
      id: department.departmentId,
      name: department.name,
    })),
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

function buildNoticeWhere(input: {
  canManage: boolean;
  role: SystemRole;
  employeeTarget: {
    branchId: number | null;
    departmentId: number | null;
  };
  filters: NoticeListSearchParams;
  includeStatusFilter: boolean;
}): Prisma.NoticeWhereInput {
  const andConditions: Prisma.NoticeWhereInput[] = [];

  if (!input.canManage) {
    andConditions.push(
      buildVisibleNoticeWhere({
        role: input.role,
        branchId: input.employeeTarget.branchId,
        departmentId: input.employeeTarget.departmentId,
      }),
    );
  }

  if (input.filters.q) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: input.filters.q,
          },
        },
        {
          body: {
            contains: input.filters.q,
          },
        },
      ],
    });
  }

  if (input.canManage && input.filters.audience !== "ANY") {
    andConditions.push({
      audience: input.filters.audience,
    });
  }

  if (
    input.includeStatusFilter &&
    input.canManage &&
    input.filters.status !== "ANY"
  ) {
    andConditions.push({
      status: input.filters.status,
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
}

export async function getNoticePageData(
  filters: NoticeListSearchParams,
): Promise<NoticePageData> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      canManage: false,
      branchOptions: [],
      departmentOptions: [],
      notices: [],
      filters,
      pagination: {
        page: 1,
        pageSize: filters.pageSize,
        totalItems: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
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

  const where = buildNoticeWhere({
    canManage,
    role: session.role,
    employeeTarget,
    filters,
    includeStatusFilter: true,
  });

  const summaryWhere = buildNoticeWhere({
    canManage,
    role: session.role,
    employeeTarget,
    filters,
    includeStatusFilter: false,
  });

  const skip = (filters.page - 1) * filters.pageSize;

  const [targetOptions, notices, totalItems, total, draft, published, archived] =
    await Promise.all([
      canManage
        ? getTargetOptions()
        : {
            branchOptions: [],
            departmentOptions: [],
          },

      prisma.notice.findMany({
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
        },
        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: filters.pageSize,
      }),

      prisma.notice.count({
        where,
      }),

      prisma.notice.count({
        where: summaryWhere,
      }),

      prisma.notice.count({
        where: {
          AND: [
            summaryWhere,
            {
              status: "DRAFT",
            },
          ],
        },
      }),

      prisma.notice.count({
        where: {
          AND: [
            summaryWhere,
            {
              status: "PUBLISHED",
            },
          ],
        },
      }),

      prisma.notice.count({
        where: {
          AND: [
            summaryWhere,
            {
              status: "ARCHIVED",
            },
          ],
        },
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    canManage,
    branchOptions: targetOptions.branchOptions,
    departmentOptions: targetOptions.departmentOptions,
    notices: notices.map(mapNotice),
    filters,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    },
    summary: {
      total,
      draft,
      published,
      archived,
    },
  };
}

export async function getNoticeEditData(
  noticeId: string,
): Promise<NoticeEditData | null> {
  const session = await getCurrentSession();

  if (!session || !canManageNotices(session.role)) {
    return null;
  }

  const parsedNoticeId = Number(noticeId);

  if (!Number.isInteger(parsedNoticeId) || parsedNoticeId <= 0) {
    return null;
  }

  const [notice, targetOptions] = await Promise.all([
    prisma.notice.findUnique({
      where: {
        noticeId: parsedNoticeId,
      },
      select: {
        noticeId: true,
        title: true,
        body: true,
        audience: true,
        branchId: true,
        departmentId: true,
        expiresAt: true,
        status: true,
      },
    }),

    getTargetOptions(),
  ]);

  if (!notice) {
    return null;
  }

  return {
    noticeId: notice.noticeId,
    title: notice.title,
    body: notice.body,
    audience: notice.audience,
    branchId: notice.branchId,
    departmentId: notice.departmentId,
    expiresAtInput: formatDateTimeLocalInput(notice.expiresAt),
    status: notice.status,
    branchOptions: targetOptions.branchOptions,
    departmentOptions: targetOptions.departmentOptions,
  };
}