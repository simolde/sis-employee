import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { SystemRole } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import type { NoticeAudienceValue } from "../types/notice-types";
import type { TopbarNoticeItem } from "../types/topbar-notice-types";

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
  };
}

export async function getTopbarNotices(): Promise<TopbarNoticeItem[]> {
  const session = await getCurrentSession();

  if (!session) {
    return [];
  }

  const employeeTarget = await getCurrentEmployeeTarget(session.userId);

  const notices = await prisma.notice.findMany({
    where: buildTopbarNoticeWhere({
      role: session.role,
      branchId: employeeTarget.branchId,
      departmentId: employeeTarget.departmentId,
    }),
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
  });

  return notices.map(mapTopbarNotice);
}