import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  AbsenceRollbackFilters,
  AbsenceRollbackItem,
  AbsenceRollbackOptions,
  AbsenceRollbackResult,
} from "../types/absence-rollback-types";

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

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getManilaDateInputValue(offsetDays = 0): string {
  const now = new Date();
  const targetDate = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function dateInputToStartDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function dateInputToEndDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() + 1);

  return date;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
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

export function buildAbsenceRollbackEligibleWhere(
  filters: AbsenceRollbackFilters,
): Prisma.AttendanceWhereInput {
  const andConditions: Prisma.AttendanceWhereInput[] = [
    {
      status: "ABSENT",
      isManual: false,
      timeIn: null,
      timeOut: null,
    },
  ];

  const branchId = parsePositiveId(filters.branchId);
  const departmentId = parsePositiveId(filters.departmentId);
  const scheduleId = parsePositiveId(filters.scheduleId);
  const dateFrom = dateInputToStartDate(filters.dateFrom);
  const dateTo = dateInputToEndDate(filters.dateTo);

  if (dateFrom || dateTo) {
    andConditions.push({
      attDate: {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lt: dateTo } : {}),
      },
    });
  }

  if (branchId) {
    andConditions.push({
      employee: {
        branchId,
      },
    });
  }

  if (departmentId) {
    andConditions.push({
      employee: {
        departmentId,
      },
    });
  }

  if (scheduleId) {
    andConditions.push({
      scheduleId,
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
            branch: {
              name: {
                contains: filters.q,
              },
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
      ],
    });
  }

  return {
    AND: andConditions,
  };
}

function mapRollbackItem(input: {
  attendanceId: number;
  attDate: Date;
  createdAt: Date;
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
  } | null;
}): AbsenceRollbackItem {
  return {
    attendanceId: input.attendanceId,
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
    scheduleName: input.schedule
      ? `${input.schedule.scheduleCode} · ${input.schedule.name}`
      : "—",
    attDate: formatDate(input.attDate),
    createdAt: formatDateTime(input.createdAt),
  };
}

export function parseAbsenceRollbackSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AbsenceRollbackFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    branchId: singleSearchParam(searchParams.branchId),
    departmentId: singleSearchParam(searchParams.departmentId),
    scheduleId: singleSearchParam(searchParams.scheduleId),
    dateFrom: singleSearchParam(searchParams.dateFrom, getManilaDateInputValue(-7)),
    dateTo: singleSearchParam(searchParams.dateTo, getManilaDateInputValue()),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getAbsenceRollbackOptions(): Promise<AbsenceRollbackOptions> {
  const [branches, departments, schedules] = await Promise.all([
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

    prisma.shiftSchedule.findMany({
      select: {
        scheduleId: true,
        scheduleCode: true,
        name: true,
      },
      orderBy: [
        {
          scheduleCode: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),
  ]);

  return {
    branches: branches.map((branch) => ({
      id: branch.branchId,
      label: branch.name,
    })),
    departments: departments.map((department) => ({
      id: department.departmentId,
      label: department.name,
    })),
    schedules: schedules.map((schedule) => ({
      id: schedule.scheduleId,
      label: `${schedule.scheduleCode} · ${schedule.name}`,
    })),
  };
}

export async function getAbsenceRollbackData(
  filters: AbsenceRollbackFilters,
): Promise<AbsenceRollbackResult> {
  const where = buildAbsenceRollbackEligibleWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    records,
    options,
    totalItems,
    protectedManualAbsences,
    protectedAbsencesWithPunches,
  ] = await Promise.all([
    prisma.attendance.findMany({
      where,
      select: {
        attendanceId: true,
        attDate: true,
        createdAt: true,
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
          },
        },
      },
      orderBy: [
        {
          attDate: "desc",
        },
        {
          attendanceId: "desc",
        },
      ],
      skip,
      take: filters.pageSize,
    }),

    getAbsenceRollbackOptions(),

    prisma.attendance.count({
      where,
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
        isManual: true,
      },
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
        OR: [
          {
            timeIn: {
              not: null,
            },
          },
          {
            timeOut: {
              not: null,
            },
          },
        ],
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    filters,
    options,
    records: records.map(mapRollbackItem),
    summary: {
      rollbackEligibleRecords: totalItems,
      currentPageRecords: records.length,
      protectedManualAbsences,
      protectedAbsencesWithPunches,
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