import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  ExcusedReconciliationFilters,
  ExcusedReconciliationItem,
  ExcusedReconciliationOptions,
  ExcusedReconciliationResult,
} from "../types/excused-reconciliation-types";

const DEFAULT_PAGE_SIZE = 20;

type AutomaticExcusedRecord = {
  attendanceId: number;
  empId: number;
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
};

type ApprovedLeaveCoverage = {
  leaveId: number;
  empId: number;
  dateFrom: Date;
  dateTo: Date;
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

function getManilaDateInputValue(offsetDays = 0): string {
  const now = new Date();

  const targetDate = new Date(
    now.getTime() + offsetDays * 24 * 60 * 60 * 1000,
  );

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

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function dateInputToEndDate(value: string): Date | undefined {
  const start = dateInputToStartDate(value);

  if (!start) {
    return undefined;
  }

  const end = new Date(start);

  end.setUTCDate(end.getUTCDate() + 1);

  return end;
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

function isDateCoveredByApprovedLeave(input: {
  empId: number;
  attDate: Date;
  leaves: ApprovedLeaveCoverage[];
}): boolean {
  return input.leaves.some(
    (leave) =>
      leave.empId === input.empId &&
      leave.dateFrom.getTime() <= input.attDate.getTime() &&
      leave.dateTo.getTime() >= input.attDate.getTime(),
  );
}

function getMinDate(records: AutomaticExcusedRecord[]): Date | null {
  if (records.length === 0) {
    return null;
  }

  return new Date(
    Math.min(...records.map((record) => record.attDate.getTime())),
  );
}

function getMaxDate(records: AutomaticExcusedRecord[]): Date | null {
  if (records.length === 0) {
    return null;
  }

  return new Date(
    Math.max(...records.map((record) => record.attDate.getTime())),
  );
}

export function buildExcusedReconciliationScopeWhere(
  filters: ExcusedReconciliationFilters,
): Prisma.AttendanceWhereInput {
  const andConditions: Prisma.AttendanceWhereInput[] = [
    {
      status: "EXCUSED",
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

export function buildAutomaticExcusedReconciliationWhere(
  filters: ExcusedReconciliationFilters,
): Prisma.AttendanceWhereInput {
  return {
    AND: [
      buildExcusedReconciliationScopeWhere(filters),
      {
        isManual: false,
        timeIn: null,
        timeOut: null,
      },
    ],
  };
}

export function parseExcusedReconciliationSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ExcusedReconciliationFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    branchId: singleSearchParam(searchParams.branchId),
    departmentId: singleSearchParam(searchParams.departmentId),
    scheduleId: singleSearchParam(searchParams.scheduleId),
    dateFrom: singleSearchParam(
      searchParams.dateFrom,
      getManilaDateInputValue(-30),
    ),
    dateTo: singleSearchParam(
      searchParams.dateTo,
      getManilaDateInputValue(),
    ),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getExcusedReconciliationOptions(): Promise<ExcusedReconciliationOptions> {
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

async function getApprovedLeaveCoverage(
  records: AutomaticExcusedRecord[],
): Promise<ApprovedLeaveCoverage[]> {
  const empIds = Array.from(
    new Set(records.map((record) => record.empId)),
  );

  const minDate = getMinDate(records);
  const maxDate = getMaxDate(records);

  if (empIds.length === 0 || !minDate || !maxDate) {
    return [];
  }

  return prisma.leave.findMany({
    where: {
      empId: {
        in: empIds,
      },
      status: "APPROVED",
      dateFrom: {
        lte: maxDate,
      },
      dateTo: {
        gte: minDate,
      },
    },
    select: {
      leaveId: true,
      empId: true,
      dateFrom: true,
      dateTo: true,
    },
  });
}

async function getGeneratedAttendanceIds(
  records: AutomaticExcusedRecord[],
): Promise<Set<number>> {
  if (records.length === 0) {
    return new Set<number>();
  }

  const logs = await prisma.activityLog.findMany({
    where: {
      action: "ATTENDANCE_EXCUSED_AUTO_GENERATED",
      entityType: "attendance",
      entityId: {
        in: records.map((record) => String(record.attendanceId)),
      },
    },
    select: {
      entityId: true,
    },
  });

  return new Set(
    logs
      .map((log) => Number(log.entityId))
      .filter((attendanceId) => Number.isInteger(attendanceId)),
  );
}

function mapReconciliationItem(input: {
  record: AutomaticExcusedRecord;
  generationLogFound: boolean;
}): ExcusedReconciliationItem {
  return {
    attendanceId: input.record.attendanceId,
    empId: input.record.employee.empId,
    empNumber: input.record.employee.empNumber,
    employeeName: formatFullName({
      firstName: input.record.employee.firstName,
      middleName: input.record.employee.middleName,
      lastName: input.record.employee.lastName,
    }),
    employeeStatus: input.record.employee.status,
    branchName: input.record.employee.branch.name,
    departmentName: dash(input.record.employee.department?.name),
    scheduleName: input.record.schedule
      ? `${input.record.schedule.scheduleCode} · ${input.record.schedule.name}`
      : "—",
    attDate: formatDate(input.record.attDate),
    createdAt: formatDateTime(input.record.createdAt),
    generationLogFound: input.generationLogFound,
    rollbackEligible: input.generationLogFound,
    issueLabel: input.generationLogFound
      ? "APPROVED LEAVE NO LONGER FOUND"
      : "GENERATION PROVENANCE NOT FOUND",
  };
}

export async function getExcusedReconciliationData(
  filters: ExcusedReconciliationFilters,
): Promise<ExcusedReconciliationResult> {
  const scopeWhere = buildExcusedReconciliationScopeWhere(filters);
  const automaticWhere = buildAutomaticExcusedReconciliationWhere(filters);

  const [
    automaticRecords,
    options,
    manualExcusedProtected,
    punchedExcusedProtected,
  ] = await Promise.all([
    prisma.attendance.findMany({
      where: automaticWhere,
      select: {
        attendanceId: true,
        empId: true,
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
    }),

    getExcusedReconciliationOptions(),

    prisma.attendance.count({
      where: {
        AND: [
          scopeWhere,
          {
            isManual: true,
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          scopeWhere,
          {
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
        ],
      },
    }),
  ]);

  const [approvedLeaves, generatedAttendanceIds] = await Promise.all([
    getApprovedLeaveCoverage(automaticRecords),
    getGeneratedAttendanceIds(automaticRecords),
  ]);

  const protectedByApprovedLeaveRecords = automaticRecords.filter((record) =>
    isDateCoveredByApprovedLeave({
      empId: record.empId,
      attDate: record.attDate,
      leaves: approvedLeaves,
    }),
  );

  const staleRecords = automaticRecords.filter(
    (record) =>
      !isDateCoveredByApprovedLeave({
        empId: record.empId,
        attDate: record.attDate,
        leaves: approvedLeaves,
      }),
  );

  const mappedStaleRecords = staleRecords.map((record) =>
    mapReconciliationItem({
      record,
      generationLogFound: generatedAttendanceIds.has(record.attendanceId),
    }),
  );

  const rollbackEligibleRecords = mappedStaleRecords.filter(
    (record) => record.rollbackEligible,
  );

  const missingGenerationProvenance = mappedStaleRecords.filter(
    (record) => !record.generationLogFound,
  ).length;

  const totalItems = mappedStaleRecords.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / filters.pageSize),
  );
  const safePage = Math.min(filters.page, totalPages);
  const startIndex = (safePage - 1) * filters.pageSize;
  const records = mappedStaleRecords.slice(
    startIndex,
    startIndex + filters.pageSize,
  );

  return {
    filters: {
      ...filters,
      page: safePage,
    },
    options,
    records,
    summary: {
      automaticExcusedChecked: automaticRecords.length,
      rollbackEligible: rollbackEligibleRecords.length,
      protectedByApprovedLeave: protectedByApprovedLeaveRecords.length,
      missingGenerationProvenance,
      manualExcusedProtected,
      punchedExcusedProtected,
      currentPageRecords: records.length,
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