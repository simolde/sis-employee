import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  ExcusedRecordFilters,
  ExcusedRecordItem,
  ExcusedRecordLeaveDetails,
  ExcusedRecordOptions,
  ExcusedRecordResult,
  ExcusedRecordSourceFilter,
} from "../types/excused-record-types";

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

function normalizeSource(
  value: string,
): ExcusedRecordSourceFilter {
  const normalized = value.trim().toUpperCase();

  if (
    normalized === "AUTOMATIC" ||
    normalized === "MANUAL"
  ) {
    return normalized;
  }

  return "";
}

function getManilaDateInputValue(offsetDays = 0): string {
  const now = new Date();

  const targetDate = new Date(
    now.getTime() +
      offsetDays * 24 * 60 * 60 * 1000,
  );

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);

  const year =
    parts.find((part) => part.type === "year")
      ?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")
      ?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")
      ?.value ?? "";

  return `${year}-${month}-${day}`;
}

function dateInputToStartDate(
  value: string,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function dateInputToEndDate(
  value: string,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  date.setUTCDate(date.getUTCDate() + 1);

  return date;
}

function formatDate(
  date: Date | null | undefined,
): string {
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

function formatDateTime(
  date: Date | null | undefined,
): string {
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

function dash(
  value: string | null | undefined,
): string {
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

function buildExcusedRecordWhere(
  filters: ExcusedRecordFilters,
): Prisma.AttendanceWhereInput {
  const andConditions: Prisma.AttendanceWhereInput[] =
    [
      {
        status: "EXCUSED",
      },
    ];

  const branchId = parsePositiveId(
    filters.branchId,
  );

  const departmentId = parsePositiveId(
    filters.departmentId,
  );

  const scheduleId = parsePositiveId(
    filters.scheduleId,
  );

  const dateFrom = dateInputToStartDate(
    filters.dateFrom,
  );

  const dateTo = dateInputToEndDate(
    filters.dateTo,
  );

  if (dateFrom || dateTo) {
    andConditions.push({
      attDate: {
        ...(dateFrom
          ? {
              gte: dateFrom,
            }
          : {}),
        ...(dateTo
          ? {
              lt: dateTo,
            }
          : {}),
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

  if (filters.source === "AUTOMATIC") {
    andConditions.push({
      isManual: false,
    });
  }

  if (filters.source === "MANUAL") {
    andConditions.push({
      isManual: true,
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

export function parseExcusedRecordSearchParams(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
): ExcusedRecordFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    branchId: singleSearchParam(
      searchParams.branchId,
    ),
    departmentId: singleSearchParam(
      searchParams.departmentId,
    ),
    scheduleId: singleSearchParam(
      searchParams.scheduleId,
    ),
    source: normalizeSource(
      singleSearchParam(searchParams.source),
    ),
    dateFrom: singleSearchParam(
      searchParams.dateFrom,
      getManilaDateInputValue(-30),
    ),
    dateTo: singleSearchParam(
      searchParams.dateTo,
      getManilaDateInputValue(),
    ),
    page: parsePositiveInteger(
      singleSearchParam(searchParams.page),
      1,
    ),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getExcusedRecordOptions(): Promise<ExcusedRecordOptions> {
  const [branches, departments, schedules] =
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

    departments: departments.map(
      (department) => ({
        id: department.departmentId,
        label: department.name,
      }),
    ),

    schedules: schedules.map((schedule) => ({
      id: schedule.scheduleId,
      label: `${schedule.scheduleCode} · ${schedule.name}`,
    })),
  };
}

type ExcusedAttendanceRecord = {
  attendanceId: number;
  empId: number;
  attDate: Date;
  status: string;
  isManual: boolean;
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
    shift: {
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  } | null;
};

type ApprovedLeaveRecord = {
  leaveId: number;
  empId: number;
  dateFrom: Date;
  dateTo: Date;
  leaveType: {
    name: string;
  };
};

function findApprovedLeave(
  attendance: ExcusedAttendanceRecord,
  leaves: ApprovedLeaveRecord[],
): ExcusedRecordLeaveDetails | null {
  const matchingLeave = leaves.find(
    (leave) =>
      leave.empId === attendance.empId &&
      leave.dateFrom.getTime() <=
        attendance.attDate.getTime() &&
      leave.dateTo.getTime() >=
        attendance.attDate.getTime(),
  );

  if (!matchingLeave) {
    return null;
  }

  return {
    leaveId: matchingLeave.leaveId,
    leaveTypeName:
      matchingLeave.leaveType.name,
    dateFrom: formatDate(
      matchingLeave.dateFrom,
    ),
    dateTo: formatDate(matchingLeave.dateTo),
  };
}

function mapExcusedRecord(input: {
  attendance: ExcusedAttendanceRecord;
  leaves: ApprovedLeaveRecord[];
}): ExcusedRecordItem {
  const leave = findApprovedLeave(
    input.attendance,
    input.leaves,
  );

  return {
    attendanceId:
      input.attendance.attendanceId,
    empId: input.attendance.employee.empId,
    empNumber:
      input.attendance.employee.empNumber,
    employeeName: formatFullName({
      firstName:
        input.attendance.employee.firstName,
      middleName:
        input.attendance.employee.middleName,
      lastName:
        input.attendance.employee.lastName,
    }),
    employeeStatus:
      input.attendance.employee.status,
    branchName:
      input.attendance.employee.branch.name,
    departmentName: dash(
      input.attendance.employee.department?.name,
    ),
    scheduleName: input.attendance.schedule
      ? `${input.attendance.schedule.scheduleCode} · ${input.attendance.schedule.name}`
      : "—",
    shiftTime: input.attendance.schedule
      ? formatShiftTime({
          startTime:
            input.attendance.schedule.shift
              .startTime,
          endTime:
            input.attendance.schedule.shift
              .endTime,
          isOvernight:
            input.attendance.schedule.shift
              .isOvernight,
        })
      : "—",
    attDate: formatDate(
      input.attendance.attDate,
    ),
    status: "EXCUSED",
    isManual: input.attendance.isManual,
    sourceLabel: input.attendance.isManual
      ? "MANUAL"
      : leave
        ? "APPROVED LEAVE"
        : "AUTOMATIC",
    createdAt: formatDateTime(
      input.attendance.createdAt,
    ),
    leave,
  };
}

export async function getExcusedRecordData(
  filters: ExcusedRecordFilters,
): Promise<ExcusedRecordResult> {
  const where = buildExcusedRecordWhere(filters);

  const [
    options,
    totalItems,
    totalExcused,
    automaticExcused,
    manualExcused,
  ] = await Promise.all([
    getExcusedRecordOptions(),

    prisma.attendance.count({
      where,
    }),

    prisma.attendance.count({
      where: {
        status: "EXCUSED",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "EXCUSED",
        isManual: false,
      },
    }),

    prisma.attendance.count({
      where: {
        status: "EXCUSED",
        isManual: true,
      },
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / filters.pageSize),
  );

  const safePage = Math.min(
    filters.page,
    totalPages,
  );

  const skip =
    (safePage - 1) * filters.pageSize;

  const attendanceRecords =
    await prisma.attendance.findMany({
      where,
      select: {
        attendanceId: true,
        empId: true,
        attDate: true,
        status: true,
        isManual: true,
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
          attDate: "desc",
        },
        {
          attendanceId: "desc",
        },
      ],
      skip,
      take: filters.pageSize,
    });

  const empIds = Array.from(
    new Set(
      attendanceRecords.map(
        (record) => record.empId,
      ),
    ),
  );

  const attendanceDates =
    attendanceRecords.map(
      (record) => record.attDate,
    );

  const minAttendanceDate =
    attendanceDates.length > 0
      ? new Date(
          Math.min(
            ...attendanceDates.map((date) =>
              date.getTime(),
            ),
          ),
        )
      : null;

  const maxAttendanceDate =
    attendanceDates.length > 0
      ? new Date(
          Math.max(
            ...attendanceDates.map((date) =>
              date.getTime(),
            ),
          ),
        )
      : null;

  const approvedLeaves =
    empIds.length > 0 &&
    minAttendanceDate &&
    maxAttendanceDate
      ? await prisma.leave.findMany({
          where: {
            empId: {
              in: empIds,
            },
            status: "APPROVED",
            dateFrom: {
              lte: maxAttendanceDate,
            },
            dateTo: {
              gte: minAttendanceDate,
            },
          },
          select: {
            leaveId: true,
            empId: true,
            dateFrom: true,
            dateTo: true,
            leaveType: {
              select: {
                name: true,
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
        })
      : [];

  const records = attendanceRecords.map(
    (attendance) =>
      mapExcusedRecord({
        attendance,
        leaves: approvedLeaves,
      }),
  );

  const linkedApprovedLeave =
    records.filter(
      (record) => record.leave !== null,
    ).length;

  return {
    filters: {
      ...filters,
      page: safePage,
    },
    options,
    records,
    summary: {
      totalExcused,
      matchingExcused: totalItems,
      automaticExcused,
      manualExcused,
      linkedApprovedLeave,
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