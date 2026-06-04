import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  AbsenceCandidateBlockingException,
  AbsenceCandidateFilters,
  AbsenceCandidateItem,
  AbsenceCandidateOptions,
  AbsenceCandidateResult,
} from "../types/absence-candidate-types";

const DEFAULT_PAGE_SIZE = 20;

const weekdayTokens = [
  { index: 0, short: "SUN", long: "SUNDAY", numberTokens: ["0", "7"] },
  { index: 1, short: "MON", long: "MONDAY", numberTokens: ["1"] },
  { index: 2, short: "TUE", long: "TUESDAY", numberTokens: ["2"] },
  { index: 3, short: "WED", long: "WEDNESDAY", numberTokens: ["3"] },
  { index: 4, short: "THU", long: "THURSDAY", numberTokens: ["4"] },
  { index: 5, short: "FRI", long: "FRIDAY", numberTokens: ["5"] },
  { index: 6, short: "SAT", long: "SATURDAY", numberTokens: ["6"] },
];

type AbsenceBlockingExceptionRecord = {
  exceptionId: number;
  branchId: number | null;
  exceptionType: string;
  title: string;
};

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

function normalizeActiveOnly(value: string): boolean {
  return value !== "false";
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

function parseDateInput(value: string): Date {
  const fallbackDate = getManilaDateInputValue(-1);
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallbackDate;

  return new Date(`${dateValue}T00:00:00.000Z`);
}

function getDateRange(value: string): {
  start: Date;
  end: Date;
} {
  const start = parseDateInput(value);
  const end = new Date(start);

  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start,
    end,
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
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
  return `${input.startTime} - ${input.endTime}${
    input.isOvernight ? " · Overnight" : ""
  }`;
}

function normalizeScheduleDays(daysOfWeek: string | null): string {
  if (!daysOfWeek?.trim()) {
    return "All days";
  }

  return daysOfWeek;
}

function isScheduleApplicableOnDate(input: {
  date: Date;
  daysOfWeek: string | null;
}): boolean {
  if (!input.daysOfWeek?.trim()) {
    return true;
  }

  const dayIndex = input.date.getUTCDay();
  const day = weekdayTokens.find((item) => item.index === dayIndex);

  if (!day) {
    return false;
  }

  const tokens = input.daysOfWeek
    .toUpperCase()
    .split(/[\s,;/|]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.some(
    (token) =>
      token === day.short ||
      token === day.long ||
      day.numberTokens.includes(token),
  );
}

function isBlockedByException(input: {
  employeeBranchId: number;
  exceptions: AbsenceBlockingExceptionRecord[];
}): boolean {
  return input.exceptions.some(
    (exception) =>
      exception.branchId === null || exception.branchId === input.employeeBranchId,
  );
}

function buildEmployeeWhere(
  filters: AbsenceCandidateFilters,
): Prisma.EmployeeWhereInput {
  const andConditions: Prisma.EmployeeWhereInput[] = [
    {
      scheduleId: {
        not: null,
      },
    },
  ];

  const branchId = parsePositiveId(filters.branchId);
  const departmentId = parsePositiveId(filters.departmentId);
  const scheduleId = parsePositiveId(filters.scheduleId);
  const dateRange = getDateRange(filters.date);

  if (filters.activeOnly) {
    andConditions.push({
      status: "ACTIVE",
    });
  }

  if (branchId) {
    andConditions.push({
      branchId,
    });
  }

  if (departmentId) {
    andConditions.push({
      departmentId,
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
          empNumber: {
            contains: filters.q,
          },
        },
        {
          firstName: {
            contains: filters.q,
          },
        },
        {
          middleName: {
            contains: filters.q,
          },
        },
        {
          lastName: {
            contains: filters.q,
          },
        },
        {
          branch: {
            name: {
              contains: filters.q,
            },
          },
        },
        {
          department: {
            name: {
              contains: filters.q,
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

  andConditions.push({
    attendanceRecords: {
      none: {
        attDate: {
          gte: dateRange.start,
          lt: dateRange.end,
        },
      },
    },
  });

  return {
    AND: andConditions,
  };
}

function mapCandidate(input: {
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
  schedule: {
    scheduleCode: string;
    name: string;
    daysOfWeek: string | null;
    shift: {
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  } | null;
}): AbsenceCandidateItem | null {
  if (!input.schedule) {
    return null;
  }

  return {
    empId: input.empId,
    empNumber: input.empNumber,
    employeeName: formatFullName({
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
    }),
    employeeStatus: input.status,
    branchName: input.branch.name,
    departmentName: dash(input.department?.name),
    scheduleName: `${input.schedule.scheduleCode} · ${input.schedule.name}`,
    scheduleDays: normalizeScheduleDays(input.schedule.daysOfWeek),
    shiftTime: formatShiftTime({
      startTime: input.schedule.shift.startTime,
      endTime: input.schedule.shift.endTime,
      isOvernight: input.schedule.shift.isOvernight,
    }),
    expectedStatus: "ABSENT",
  };
}

async function getBlockingExceptionsForDate(
  dateValue: string,
): Promise<AbsenceBlockingExceptionRecord[]> {
  const dateRange = getDateRange(dateValue);

  return prisma.attendanceExceptionDate.findMany({
    where: {
      exceptionDate: {
        gte: dateRange.start,
        lt: dateRange.end,
      },
      status: "ACTIVE",
      affectsAbsenceGeneration: true,
    },
    select: {
      exceptionId: true,
      branchId: true,
      exceptionType: true,
      title: true,
    },
  });
}

async function mapBlockingExceptions(
  exceptions: AbsenceBlockingExceptionRecord[],
): Promise<AbsenceCandidateBlockingException[]> {
  const branchIds = Array.from(
    new Set(
      exceptions
        .map((exception) => exception.branchId)
        .filter((branchId): branchId is number => branchId !== null),
    ),
  );

  const branches =
    branchIds.length > 0
      ? await prisma.branch.findMany({
          where: {
            branchId: {
              in: branchIds,
            },
          },
          select: {
            branchId: true,
            name: true,
          },
        })
      : [];

  const branchMap = new Map(
    branches.map((branch) => [branch.branchId, branch.name]),
  );

  return exceptions.map((exception) => ({
    exceptionId: exception.exceptionId,
    title: exception.title,
    exceptionType: exception.exceptionType,
    branchName:
      exception.branchId === null
        ? "All branches"
        : branchMap.get(exception.branchId) ?? `Branch #${exception.branchId}`,
  }));
}

export function parseAbsenceCandidateSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AbsenceCandidateFilters {
  return {
    date: singleSearchParam(searchParams.date, getManilaDateInputValue(-1)),
    q: singleSearchParam(searchParams.q).trim(),
    branchId: singleSearchParam(searchParams.branchId),
    departmentId: singleSearchParam(searchParams.departmentId),
    scheduleId: singleSearchParam(searchParams.scheduleId),
    activeOnly: normalizeActiveOnly(
      singleSearchParam(searchParams.activeOnly, "true"),
    ),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getAbsenceCandidateOptions(): Promise<AbsenceCandidateOptions> {
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

export async function getAbsenceCandidateData(
  filters: AbsenceCandidateFilters,
): Promise<AbsenceCandidateResult> {
  const selectedDate = parseDateInput(filters.date);
  const where = buildEmployeeWhere(filters);

  const [
    employees,
    options,
    blockingExceptions,
    scheduledEmployees,
    employeesWithoutAttendance,
  ] = await Promise.all([
    prisma.employee.findMany({
      where,
      select: {
        empId: true,
        empNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        status: true,
        branchId: true,
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
        schedule: {
          select: {
            scheduleCode: true,
            name: true,
            daysOfWeek: true,
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
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
        {
          empId: "asc",
        },
      ],
    }),

    getAbsenceCandidateOptions(),

    getBlockingExceptionsForDate(filters.date),

    prisma.employee.count({
      where: {
        scheduleId: {
          not: null,
        },
        ...(filters.activeOnly ? { status: "ACTIVE" } : {}),
      },
    }),

    prisma.employee.count({
      where,
    }),
  ]);

  const scheduledNoAttendanceEmployees = employees.filter((employee) =>
    isScheduleApplicableOnDate({
      date: selectedDate,
      daysOfWeek: employee.schedule?.daysOfWeek ?? null,
    }),
  );

  const excludedByException = scheduledNoAttendanceEmployees.filter((employee) =>
    isBlockedByException({
      employeeBranchId: employee.branchId,
      exceptions: blockingExceptions,
    }),
  ).length;

  const allCandidates = scheduledNoAttendanceEmployees
    .filter(
      (employee) =>
        !isBlockedByException({
          employeeBranchId: employee.branchId,
          exceptions: blockingExceptions,
        }),
    )
    .map(mapCandidate)
    .filter((record): record is AbsenceCandidateItem => record !== null);

  const totalItems = allCandidates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const startIndex = (safePage - 1) * filters.pageSize;
  const records = allCandidates.slice(startIndex, startIndex + filters.pageSize);

  return {
    filters: {
      ...filters,
      page: safePage,
    },
    options,
    records,
    blockingExceptions: await mapBlockingExceptions(blockingExceptions),
    summary: {
      selectedDate: formatDate(selectedDate),
      matchingEmployees: employees.length,
      candidateAbsences: allCandidates.length,
      scheduledEmployees,
      employeesWithoutAttendance,
      excludedByException,
      activeBlockingExceptions: blockingExceptions.length,
    },
    pagination: {
      page: safePage,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  };
}