import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  ApprovedLeaveExcusedSyncCandidate,
  ApprovedLeaveExcusedSyncCandidateSeed,
  ApprovedLeaveExcusedSyncFilters,
  ApprovedLeaveExcusedSyncOptions,
  ApprovedLeaveExcusedSyncResult,
} from "../types/approved-leave-excused-sync-types";

const DEFAULT_PAGE_SIZE = 20;
const MAX_EVALUATED_DAYS = 366;

type WeekdayTokenDefinition = {
  index: number;
  short: string;
  long: string;
  numberTokens: readonly string[];
};

const weekdayTokens: readonly WeekdayTokenDefinition[] = [
  {
    index: 0,
    short: "SUN",
    long: "SUNDAY",
    numberTokens: ["0", "7"],
  },
  {
    index: 1,
    short: "MON",
    long: "MONDAY",
    numberTokens: ["1"],
  },
  {
    index: 2,
    short: "TUE",
    long: "TUESDAY",
    numberTokens: ["2"],
  },
  {
    index: 3,
    short: "WED",
    long: "WEDNESDAY",
    numberTokens: ["3"],
  },
  {
    index: 4,
    short: "THU",
    long: "THURSDAY",
    numberTokens: ["4"],
  },
  {
    index: 5,
    short: "FRI",
    long: "FRIDAY",
    numberTokens: ["5"],
  },
  {
    index: 6,
    short: "SAT",
    long: "SATURDAY",
    numberTokens: ["6"],
  },
];

type ApprovedLeaveSyncLeaveRecord = {
  leaveId: number;
  dateFrom: Date;
  dateTo: Date;
  leaveType: {
    name: string;
  };
  employee: {
    empId: number;
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    branchId: number;
    branch: {
      name: string;
    };
    department: {
      name: string;
    } | null;
    schedule: {
      scheduleId: number;
      scheduleCode: string;
      name: string;
      daysOfWeek: string | null;
    } | null;
  };
};

type AttendanceRecordKey = {
  empId: number;
  attDate: Date;
};

type BlockingExceptionRecord = {
  branchId: number | null;
  exceptionDate: Date;
};

type ApprovedLeaveSyncEvaluation = {
  matchingApprovedLeaves: number;
  evaluatedLeaveDates: number;
  alreadyHasAttendance: number;
  notScheduled: number;
  exceptionProtected: number;
  candidates: ApprovedLeaveExcusedSyncCandidate[];
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

function parsePositiveInteger(
  value: string,
  fallback: number,
): number {
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

  const target = new Date(
    now.getTime() + offsetDays * 24 * 60 * 60 * 1000,
  );

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(target);

  const year =
    parts.find((part) => part.type === "year")?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

export function parseApprovedLeaveSyncDate(
  value: string,
): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const output = new Date(date);

  output.setUTCDate(output.getUTCDate() + days);

  return output;
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

function buildEmployeeDateKey(
  empId: number,
  date: Date,
): string {
  return `${empId}:${toDateInputValue(date)}`;
}

function buildBranchDateKey(
  branchId: number | null,
  date: Date,
): string {
  return `${branchId ?? "ALL"}:${toDateInputValue(date)}`;
}

function getSafeDateRange(
  filters: ApprovedLeaveExcusedSyncFilters,
): {
  start: Date;
  endExclusive: Date;
} {
  const fallbackStart =
    parseApprovedLeaveSyncDate(
      getManilaDateInputValue(-7),
    ) ?? new Date();

  const fallbackEnd =
    parseApprovedLeaveSyncDate(
      getManilaDateInputValue(30),
    ) ?? fallbackStart;

  const parsedStart =
    parseApprovedLeaveSyncDate(filters.dateFrom) ??
    fallbackStart;

  const parsedEnd =
    parseApprovedLeaveSyncDate(filters.dateTo) ??
    fallbackEnd;

  const start =
    parsedStart.getTime() <= parsedEnd.getTime()
      ? parsedStart
      : parsedEnd;

  const requestedEnd =
    parsedStart.getTime() <= parsedEnd.getTime()
      ? parsedEnd
      : parsedStart;

  const maximumEnd = addUtcDays(
    start,
    MAX_EVALUATED_DAYS - 1,
  );

  const endInclusive =
    requestedEnd.getTime() <= maximumEnd.getTime()
      ? requestedEnd
      : maximumEnd;

  return {
    start,
    endExclusive: addUtcDays(endInclusive, 1),
  };
}

export function isApprovedLeaveSyncScheduleDay(input: {
  date: Date;
  daysOfWeek: string | null;
}): boolean {
  if (!input.daysOfWeek?.trim()) {
    return true;
  }

  const dayIndex = input.date.getUTCDay();

  const day = weekdayTokens.find(
    (item) => item.index === dayIndex,
  );

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

function buildApprovedLeaveWhere(input: {
  filters: ApprovedLeaveExcusedSyncFilters;
  start: Date;
  endExclusive: Date;
}): Prisma.LeaveWhereInput {
  const employeeConditions: Prisma.EmployeeWhereInput[] = [
    {
      status: "ACTIVE",
    },
  ];

  const branchId = parsePositiveId(
    input.filters.branchId,
  );

  const departmentId = parsePositiveId(
    input.filters.departmentId,
  );

  if (branchId) {
    employeeConditions.push({
      branchId,
    });
  }

  if (departmentId) {
    employeeConditions.push({
      departmentId,
    });
  }

  if (input.filters.q) {
    employeeConditions.push({
      OR: [
        {
          empNumber: {
            contains: input.filters.q,
          },
        },
        {
          firstName: {
            contains: input.filters.q,
          },
        },
        {
          middleName: {
            contains: input.filters.q,
          },
        },
        {
          lastName: {
            contains: input.filters.q,
          },
        },
        {
          branch: {
            name: {
              contains: input.filters.q,
            },
          },
        },
        {
          department: {
            name: {
              contains: input.filters.q,
            },
          },
        },
      ],
    });
  }

  return {
    status: "APPROVED",
    dateFrom: {
      lt: input.endExclusive,
    },
    dateTo: {
      gte: input.start,
    },
    employee: {
      AND: employeeConditions,
    },
  };
}

function isBlockedByException(input: {
  employeeBranchId: number;
  date: Date;
  exceptionKeys: Set<string>;
}): boolean {
  const allBranchesKey = buildBranchDateKey(
    null,
    input.date,
  );

  const branchKey = buildBranchDateKey(
    input.employeeBranchId,
    input.date,
  );

  return (
    input.exceptionKeys.has(allBranchesKey) ||
    input.exceptionKeys.has(branchKey)
  );
}

function getLeaveStartWithinRange(input: {
  leaveStart: Date;
  rangeStart: Date;
}): Date {
  return input.leaveStart.getTime() >=
    input.rangeStart.getTime()
    ? input.leaveStart
    : input.rangeStart;
}

function getLeaveEndExclusiveWithinRange(input: {
  leaveEnd: Date;
  rangeEndExclusive: Date;
}): Date {
  const leaveEndExclusive = addUtcDays(
    input.leaveEnd,
    1,
  );

  return leaveEndExclusive.getTime() <=
    input.rangeEndExclusive.getTime()
    ? leaveEndExclusive
    : input.rangeEndExclusive;
}

function mapCandidate(input: {
  leave: ApprovedLeaveSyncLeaveRecord;
  attendanceDate: Date;
}): ApprovedLeaveExcusedSyncCandidate {
  const employee = input.leave.employee;

  return {
    empId: employee.empId,
    empNumber: employee.empNumber,
    employeeName: formatFullName({
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
    }),
    branchName: employee.branch.name,
    departmentName: dash(
      employee.department?.name,
    ),
    scheduleName: employee.schedule
      ? `${employee.schedule.scheduleCode} · ${employee.schedule.name}`
      : "—",
    attendanceDate: formatDate(
      input.attendanceDate,
    ),
    attendanceDateInput: toDateInputValue(
      input.attendanceDate,
    ),
    leaveId: input.leave.leaveId,
    leaveTypeName: input.leave.leaveType.name,
    leaveDateFrom: formatDate(
      input.leave.dateFrom,
    ),
    leaveDateTo: formatDate(
      input.leave.dateTo,
    ),
  };
}

async function evaluateApprovedLeaveExcusedSync(
  filters: ApprovedLeaveExcusedSyncFilters,
): Promise<ApprovedLeaveSyncEvaluation> {
  const range = getSafeDateRange(filters);

  const leaves = await prisma.leave.findMany({
    where: buildApprovedLeaveWhere({
      filters,
      start: range.start,
      endExclusive: range.endExclusive,
    }),
    select: {
      leaveId: true,
      dateFrom: true,
      dateTo: true,
      leaveType: {
        select: {
          name: true,
        },
      },
      employee: {
        select: {
          empId: true,
          empNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
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
              scheduleId: true,
              scheduleCode: true,
              name: true,
              daysOfWeek: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        dateFrom: "asc",
      },
      {
        leaveId: "asc",
      },
    ],
  });

  const employeeIds = Array.from(
    new Set(
      leaves.map(
        (leave) => leave.employee.empId,
      ),
    ),
  );

  const [attendanceRecords, blockingExceptions] =
    await Promise.all([
      employeeIds.length > 0
        ? prisma.attendance.findMany({
            where: {
              empId: {
                in: employeeIds,
              },
              attDate: {
                gte: range.start,
                lt: range.endExclusive,
              },
            },
            select: {
              empId: true,
              attDate: true,
            },
          })
        : Promise.resolve<AttendanceRecordKey[]>([]),

      prisma.attendanceExceptionDate.findMany({
        where: {
          exceptionDate: {
            gte: range.start,
            lt: range.endExclusive,
          },
          status: "ACTIVE",
          affectsAbsenceGeneration: true,
        },
        select: {
          branchId: true,
          exceptionDate: true,
        },
      }),
    ]);

  const attendanceKeys = new Set(
    attendanceRecords.map((record) =>
      buildEmployeeDateKey(
        record.empId,
        record.attDate,
      ),
    ),
  );

  const exceptionKeys = new Set(
    (
      blockingExceptions as BlockingExceptionRecord[]
    ).map((exception) =>
      buildBranchDateKey(
        exception.branchId,
        exception.exceptionDate,
      ),
    ),
  );

  const evaluatedKeys = new Set<string>();

  const candidates: ApprovedLeaveExcusedSyncCandidate[] =
    [];

  let evaluatedLeaveDates = 0;
  let alreadyHasAttendance = 0;
  let notScheduled = 0;
  let exceptionProtected = 0;

  for (const leave of leaves) {
    const employee = leave.employee;

    const leaveStart = getLeaveStartWithinRange({
      leaveStart: leave.dateFrom,
      rangeStart: range.start,
    });

    const leaveEndExclusive =
      getLeaveEndExclusiveWithinRange({
        leaveEnd: leave.dateTo,
        rangeEndExclusive: range.endExclusive,
      });

    for (
      let date = new Date(leaveStart);
      date.getTime() <
      leaveEndExclusive.getTime();
      date = addUtcDays(date, 1)
    ) {
      const employeeDateKey =
        buildEmployeeDateKey(
          employee.empId,
          date,
        );

      if (evaluatedKeys.has(employeeDateKey)) {
        continue;
      }

      evaluatedKeys.add(employeeDateKey);
      evaluatedLeaveDates += 1;

      if (
        !employee.schedule ||
        !isApprovedLeaveSyncScheduleDay({
          date,
          daysOfWeek:
            employee.schedule.daysOfWeek,
        })
      ) {
        notScheduled += 1;
        continue;
      }

      if (
        isBlockedByException({
          employeeBranchId:
            employee.branchId,
          date,
          exceptionKeys,
        })
      ) {
        exceptionProtected += 1;
        continue;
      }

      if (
        attendanceKeys.has(employeeDateKey)
      ) {
        alreadyHasAttendance += 1;
        continue;
      }

      candidates.push(
        mapCandidate({
          leave,
          attendanceDate: date,
        }),
      );
    }
  }

  candidates.sort((left, right) => {
    const dateComparison =
      left.attendanceDateInput.localeCompare(
        right.attendanceDateInput,
      );

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return left.employeeName.localeCompare(
      right.employeeName,
    );
  });

  return {
    matchingApprovedLeaves: leaves.length,
    evaluatedLeaveDates,
    alreadyHasAttendance,
    notScheduled,
    exceptionProtected,
    candidates,
  };
}

export function parseApprovedLeaveExcusedSyncSearchParams(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
): ApprovedLeaveExcusedSyncFilters {
  return {
    q: singleSearchParam(
      searchParams.q,
    ).trim(),
    branchId: singleSearchParam(
      searchParams.branchId,
    ),
    departmentId: singleSearchParam(
      searchParams.departmentId,
    ),
    dateFrom: singleSearchParam(
      searchParams.dateFrom,
      getManilaDateInputValue(-7),
    ),
    dateTo: singleSearchParam(
      searchParams.dateTo,
      getManilaDateInputValue(30),
    ),
    page: parsePositiveInteger(
      singleSearchParam(searchParams.page),
      1,
    ),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getApprovedLeaveExcusedSyncOptions(): Promise<ApprovedLeaveExcusedSyncOptions> {
  const [branches, departments] =
    await Promise.all([
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
    branches: branches.map((branch) => ({
      id: branch.branchId,
      label: branch.name,
    })),
    departments: departments.map(
      (department) => ({
        id: department.departmentId,
        label: department.name,
      }),
    ),
  };
}

export async function getApprovedLeaveExcusedSyncCandidateSeeds(
  filters: ApprovedLeaveExcusedSyncFilters,
  maximumRecords = 5000,
): Promise<ApprovedLeaveExcusedSyncCandidateSeed[]> {
  const evaluation =
    await evaluateApprovedLeaveExcusedSync(
      filters,
    );

  return evaluation.candidates
    .slice(0, maximumRecords)
    .map((candidate) => ({
      empId: candidate.empId,
      empNumber: candidate.empNumber,
      attendanceDateInput:
        candidate.attendanceDateInput,
    }));
}

export async function getApprovedLeaveExcusedSyncData(
  filters: ApprovedLeaveExcusedSyncFilters,
): Promise<ApprovedLeaveExcusedSyncResult> {
  const [evaluation, options] =
    await Promise.all([
      evaluateApprovedLeaveExcusedSync(
        filters,
      ),
      getApprovedLeaveExcusedSyncOptions(),
    ]);

  const totalItems =
    evaluation.candidates.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / filters.pageSize,
    ),
  );

  const safePage = Math.min(
    filters.page,
    totalPages,
  );

  const startIndex =
    (safePage - 1) * filters.pageSize;

  const records =
    evaluation.candidates.slice(
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
      matchingApprovedLeaves:
        evaluation.matchingApprovedLeaves,
      evaluatedLeaveDates:
        evaluation.evaluatedLeaveDates,
      missingExcusedCandidates:
        evaluation.candidates.length,
      alreadyHasAttendance:
        evaluation.alreadyHasAttendance,
      notScheduled:
        evaluation.notScheduled,
      exceptionProtected:
        evaluation.exceptionProtected,
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