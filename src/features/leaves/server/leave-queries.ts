import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canManageLeaves } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import { formatFullName } from "@/lib/utils/formatting";
import { leaveListSearchParamsSchema } from "../validators/leave-validation";
import type {
  LeaveListItem,
  LeaveListSearchParams,
  LeavePageData,
  LeaveStatusFilterValue,
  LeaveStatusValue,
} from "../types/leave-types";

function getSearchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseLeaveListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): LeaveListSearchParams {
  const parsed = leaveListSearchParamsSchema.parse({
    status: getSearchParamValue(searchParams.status),
    page: getSearchParamValue(searchParams.page),
    pageSize: getSearchParamValue(searchParams.pageSize),
  });

  return {
    status: parsed.status as LeaveStatusFilterValue,
    page: parsed.page,
    pageSize: parsed.pageSize,
  };
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
    timeZone: "Asia/Manila",
  }).format(date);
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function decimalText(value: { toString(): string }): string {
  return value.toString();
}

function mapLeaveListItem(leave: {
  leaveId: number;
  dateFrom: Date;
  dateTo: Date;
  totalDays: { toString(): string };
  reason: string;
  status: LeaveStatusValue;
  rejectionReason: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  leaveType: {
    name: string;
  };
  employee: {
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    department: {
      name: string;
    } | null;
  };
  approvedBy: {
    username: string;
  } | null;
}): LeaveListItem {
  return {
    leaveId: leave.leaveId,
    employeeName: formatFullName({
      firstName: leave.employee.firstName,
      middleName: leave.employee.middleName,
      lastName: leave.employee.lastName,
    }),
    empNumber: leave.employee.empNumber,
    departmentName: leave.employee.department?.name ?? "—",
    leaveTypeName: leave.leaveType.name,
    dateFrom: formatDate(leave.dateFrom),
    dateTo: formatDate(leave.dateTo),
    totalDays: decimalText(leave.totalDays),
    reason: leave.reason,
    status: leave.status,
    rejectionReason: dash(leave.rejectionReason),
    approvedBy: leave.approvedBy?.username ?? "—",
    approvedAt: formatDateTime(leave.approvedAt),
    createdAt: formatDateTime(leave.createdAt),
  };
}

async function getCurrentEmployeeId(userId: number): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      empId: true,
    },
  });

  return user?.empId ?? null;
}

export async function getLeavePageData(
  filters: LeaveListSearchParams,
): Promise<LeavePageData> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      canManage: false,
      leaveTypes: [],
      leaves: [],
      summary: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      },
      filters,
      pagination: {
        page: 1,
        pageSize: filters.pageSize,
        totalItems: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  const canManage = canManageLeaves(session.role);
  const currentEmpId = await getCurrentEmployeeId(session.userId);

  const where: Prisma.LeaveWhereInput = {};

  if (!canManage) {
    where.empId = currentEmpId ?? -1;
  }

  if (filters.status !== "ALL") {
    where.status = filters.status;
  }

  const summaryWhere: Prisma.LeaveWhereInput = canManage
    ? {}
    : {
        empId: currentEmpId ?? -1,
      };

  const skip = (filters.page - 1) * filters.pageSize;

  const [
    leaveTypes,
    leaves,
    totalItems,
    total,
    pending,
    approved,
    rejected,
    cancelled,
  ] = await Promise.all([
    prisma.leaveType.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        leaveTypeId: true,
        name: true,
        code: true,
        isPaid: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.leave.findMany({
      where,
      select: {
        leaveId: true,
        dateFrom: true,
        dateTo: true,
        totalDays: true,
        reason: true,
        status: true,
        rejectionReason: true,
        approvedAt: true,
        createdAt: true,
        leaveType: {
          select: {
            name: true,
          },
        },
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
          },
        },
        approvedBy: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: filters.pageSize,
    }),

    prisma.leave.count({
      where,
    }),

    prisma.leave.count({
      where: summaryWhere,
    }),

    prisma.leave.count({
      where: {
        ...summaryWhere,
        status: "PENDING",
      },
    }),

    prisma.leave.count({
      where: {
        ...summaryWhere,
        status: "APPROVED",
      },
    }),

    prisma.leave.count({
      where: {
        ...summaryWhere,
        status: "REJECTED",
      },
    }),

    prisma.leave.count({
      where: {
        ...summaryWhere,
        status: "CANCELLED",
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    canManage,
    leaveTypes,
    leaves: leaves.map(mapLeaveListItem),
    summary: {
      total,
      pending,
      approved,
      rejected,
      cancelled,
    },
    filters,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    },
  };
}