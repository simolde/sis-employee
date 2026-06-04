import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  ScheduleAssignmentHistoryFilters,
  ScheduleAssignmentHistoryItem,
  ScheduleAssignmentHistoryResult,
  ScheduleAssignmentHistoryStateFilter,
} from "../types/schedule-assignment-history-types";

const DEFAULT_PAGE_SIZE = 20;

function singleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parsePositiveInteger(value: string, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function normalizeState(
  value: string,
): ScheduleAssignmentHistoryStateFilter {
  const normalized = value.trim().toUpperCase();

  if (
    normalized === "ALL" ||
    normalized === "ACTIVE" ||
    normalized === "INACTIVE"
  ) {
    return normalized;
  }

  return "ALL";
}

function dateInputToStartDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000+08:00`);
}

function dateInputToEndDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T23:59:59.999+08:00`);
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

function formatShiftTime(input: {
  startTime: string;
  endTime: string;
  isOvernight: boolean;
}): string {
  const overnightLabel = input.isOvernight ? " · Overnight" : "";

  return `${input.startTime} - ${input.endTime}${overnightLabel}`;
}

function buildScheduleAssignmentHistoryBaseWhere(
  filters: ScheduleAssignmentHistoryFilters,
): Prisma.EmployeeScheduleAssignmentWhereInput {
  const andConditions: Prisma.EmployeeScheduleAssignmentWhereInput[] = [];

  const dateFrom = dateInputToStartDate(filters.dateFrom);
  const dateTo = dateInputToEndDate(filters.dateTo);

  if (dateFrom || dateTo) {
    andConditions.push({
      createdAt: {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      },
    });
  }

  if (filters.q) {
    andConditions.push({
      OR: [
        {
          employee: {
            empNumber: {
              contains: filters.q,
            },
          },
        },
        {
          employee: {
            firstName: {
              contains: filters.q,
            },
          },
        },
        {
          employee: {
            middleName: {
              contains: filters.q,
            },
          },
        },
        {
          employee: {
            lastName: {
              contains: filters.q,
            },
          },
        },
        {
          employee: {
            department: {
              name: {
                contains: filters.q,
              },
            },
          },
        },
        {
          employee: {
            branch: {
              name: {
                contains: filters.q,
              },
            },
          },
        },
        {
          schedule: {
            scheduleCode: {
              contains: filters.q,
            },
          },
        },
        {
          schedule: {
            name: {
              contains: filters.q,
            },
          },
        },
        {
          assignedBy: {
            username: {
              contains: filters.q,
            },
          },
        },
        {
          assignedBy: {
            email: {
              contains: filters.q,
            },
          },
        },
        {
          remarks: {
            contains: filters.q,
          },
        },
      ],
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
}

function buildScheduleAssignmentHistoryWhere(
  filters: ScheduleAssignmentHistoryFilters,
): Prisma.EmployeeScheduleAssignmentWhereInput {
  const andConditions: Prisma.EmployeeScheduleAssignmentWhereInput[] = [
    buildScheduleAssignmentHistoryBaseWhere(filters),
  ];

  if (filters.state === "ACTIVE") {
    andConditions.push({
      isActive: true,
    });
  }

  if (filters.state === "INACTIVE") {
    andConditions.push({
      isActive: false,
    });
  }

  return {
    AND: andConditions,
  };
}

function mapScheduleAssignmentHistoryItem(input: {
  assignmentId: number;
  validFrom: Date;
  validTo: Date | null;
  isActive: boolean;
  remarks: string | null;
  createdAt: Date;
  assignedBy: {
    username: string;
    email: string;
  } | null;
  employee: {
    empId: number;
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    status: string;
    branch: {
      name: string;
    };
    department: {
      name: string;
    } | null;
  };
  schedule: {
    scheduleCode: string;
    name: string;
    shift: {
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  };
}): ScheduleAssignmentHistoryItem {
  return {
    assignmentId: input.assignmentId,
    empId: input.employee.empId,
    empNumber: input.employee.empNumber,
    employeeName: formatFullName({
      firstName: input.employee.firstName,
      middleName: input.employee.middleName,
      lastName: input.employee.lastName,
    }),
    employeeStatus: input.employee.status,
    branchName: input.employee.branch.name,
    departmentName: dash(input.employee.department?.name),
    scheduleName: `${input.schedule.scheduleCode} · ${input.schedule.name}`,
    shiftTime: formatShiftTime({
      startTime: input.schedule.shift.startTime,
      endTime: input.schedule.shift.endTime,
      isOvernight: input.schedule.shift.isOvernight,
    }),
    validFrom: formatDate(input.validFrom),
    validTo: formatDate(input.validTo),
    isActive: input.isActive,
    remarks: dash(input.remarks),
    assignedByName: input.assignedBy?.username ?? "System",
    assignedByEmail: input.assignedBy?.email ?? "—",
    createdAt: formatDateTime(input.createdAt),
  };
}

export function parseScheduleAssignmentHistorySearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ScheduleAssignmentHistoryFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    state: normalizeState(singleSearchParam(searchParams.state, "ALL")),
    dateFrom: singleSearchParam(searchParams.dateFrom),
    dateTo: singleSearchParam(searchParams.dateTo),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getScheduleAssignmentHistoryData(
  filters: ScheduleAssignmentHistoryFilters,
): Promise<ScheduleAssignmentHistoryResult> {
  const baseWhere = buildScheduleAssignmentHistoryBaseWhere(filters);
  const where = buildScheduleAssignmentHistoryWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    records,
    totalItems,
    totalMatchingAssignments,
    activeAssignments,
    inactiveAssignments,
  ] = await Promise.all([
    prisma.employeeScheduleAssignment.findMany({
      where,
      select: {
        assignmentId: true,
        validFrom: true,
        validTo: true,
        isActive: true,
        remarks: true,
        createdAt: true,
        assignedBy: {
          select: {
            username: true,
            email: true,
          },
        },
        employee: {
          select: {
            empId: true,
            empNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
            status: true,
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
        schedule: {
          select: {
            scheduleCode: true,
            name: true,
            shift: {
              select: {
                startTime: true,
                endTime: true,
                isOvernight: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          assignmentId: "desc",
        },
      ],
      skip,
      take: filters.pageSize,
    }),

    prisma.employeeScheduleAssignment.count({
      where,
    }),

    prisma.employeeScheduleAssignment.count({
      where: baseWhere,
    }),

    prisma.employeeScheduleAssignment.count({
      where: {
        AND: [
          baseWhere,
          {
            isActive: true,
          },
        ],
      },
    }),

    prisma.employeeScheduleAssignment.count({
      where: {
        AND: [
          baseWhere,
          {
            isActive: false,
          },
        ],
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    filters,
    records: records.map(mapScheduleAssignmentHistoryItem),
    summary: {
      totalMatchingAssignments,
      activeAssignments,
      inactiveAssignments,
      currentPageRecords: records.length,
    },
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