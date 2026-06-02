import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName, formatMinutesToHours } from "@/lib/utils/formatting";
import { buildAttendanceReviewRequiredWhere } from "@/features/attendance/server/attendance-review-policy";
import {
  attendanceReviewQueueStatusValues,
  type AttendanceReviewQueueFilters,
  type AttendanceReviewQueueItem,
  type AttendanceReviewQueueResult,
  type AttendanceReviewQueueStatusValue,
} from "../types/attendance-review-queue-types";

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

function isValidReviewStatus(
  value: string,
): value is AttendanceReviewQueueStatusValue {
  return attendanceReviewQueueStatusValues.includes(
    value as AttendanceReviewQueueStatusValue,
  );
}

function dateInputToDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000Z`);
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

function formatTime(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function buildAttendanceReviewQueueWhere(
  filters: AttendanceReviewQueueFilters,
): Prisma.AttendanceWhereInput {
  const andConditions: Prisma.AttendanceWhereInput[] = [
    buildAttendanceReviewRequiredWhere(),
  ];

  const dateFrom = dateInputToDate(filters.dateFrom);
  const dateTo = dateInputToDate(filters.dateTo);

  if (dateFrom || dateTo) {
    andConditions.push({
      attDate: {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      },
    });
  }

  if (filters.reviewStatus === "OPEN") {
    andConditions.push({
      approvedAt: null,
    });
  }

  if (filters.reviewStatus === "VERIFIED") {
    andConditions.push({
      verifiedAt: {
        not: null,
      },
      approvedAt: null,
    });
  }

  if (filters.reviewStatus === "APPROVED") {
    andConditions.push({
      approvedAt: {
        not: null,
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

function buildReviewReason(input: {
  isManual: boolean;
  inSource: string | null;
  outSource: string | null;
  logs: {
    punchType: string;
    source: string;
  }[];
}): string {
  const reasons = new Set<string>();

  if (input.isManual) {
    reasons.add("Manual attendance");
  }

  if (input.inSource === "MANUAL" || input.outSource === "MANUAL") {
    reasons.add("Manual source");
  }

  if (
    input.logs.some(
      (log) => log.source === "MANUAL" && log.punchType === "MANUAL_EDIT",
    )
  ) {
    reasons.add("Manual edit");
  }

  if (
    input.logs.some(
      (log) => log.source === "MANUAL" && log.punchType === "CORRECTION",
    )
  ) {
    reasons.add("Manual correction");
  }

  return Array.from(reasons).join(", ") || "Review required";
}

function mapReviewQueueItem(input: {
  attendanceId: number;
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  inSource: string | null;
  outSource: string | null;
  status: string;
  totalMinutes: number | null;
  isManual: boolean;
  verifiedAt: Date | null;
  approvedAt: Date | null;
  employee: {
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
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
  verifiedBy: {
    username: string;
  } | null;
  approvedBy: {
    username: string;
  } | null;
  logs: {
    punchType: string;
    source: string;
    punchedAt: Date;
    remarks: string | null;
    reason: string | null;
  }[];
}): AttendanceReviewQueueItem {
  const employeeName = formatFullName({
    firstName: input.employee.firstName,
    middleName: input.employee.middleName,
    lastName: input.employee.lastName,
  });

  const latestReviewLog = input.logs[0];

  return {
    attendanceId: input.attendanceId,
    empNumber: input.employee.empNumber,
    employeeName,
    branchName: input.employee.branch.name,
    departmentName: input.employee.department?.name ?? "—",
    scheduleName: input.schedule
      ? `${input.schedule.scheduleCode} · ${input.schedule.name}`
      : "—",
    attDate: formatDate(input.attDate),
    timeIn: formatTime(input.timeIn),
    timeOut: formatTime(input.timeOut),
    source: input.outSource ?? input.inSource ?? "—",
    attendanceStatus: input.status,
    totalHours: formatMinutesToHours(input.totalMinutes),
    reviewReason: buildReviewReason({
      isManual: input.isManual,
      inSource: input.inSource,
      outSource: input.outSource,
      logs: input.logs,
    }),
    isManual: input.isManual,
    verifiedBy: input.verifiedBy?.username ?? "—",
    verifiedAt: formatDateTime(input.verifiedAt),
    approvedBy: input.approvedBy?.username ?? "—",
    approvedAt: formatDateTime(input.approvedAt),
    latestReviewLog: latestReviewLog
      ? `${latestReviewLog.punchType.replaceAll("_", " ")} · ${formatDateTime(
          latestReviewLog.punchedAt,
        )} · ${dash(latestReviewLog.reason || latestReviewLog.remarks)}`
      : "—",
  };
}

export function parseAttendanceReviewQueueSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AttendanceReviewQueueFilters {
  const rawReviewStatus = singleSearchParam(
    searchParams.reviewStatus,
    "OPEN",
  ).toUpperCase();

  return {
    q: singleSearchParam(searchParams.q).trim(),
    dateFrom: singleSearchParam(searchParams.dateFrom),
    dateTo: singleSearchParam(searchParams.dateTo),
    reviewStatus: isValidReviewStatus(rawReviewStatus)
      ? rawReviewStatus
      : "OPEN",
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getAttendanceReviewQueueData(
  filters: AttendanceReviewQueueFilters,
): Promise<AttendanceReviewQueueResult> {
  const where = buildAttendanceReviewQueueWhere(filters);
  const reviewRequiredWhere = buildAttendanceReviewRequiredWhere();
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    records,
    totalItems,
    totalReviewRequired,
    openReview,
    verifiedNotApproved,
    approved,
  ] = await Promise.all([
    prisma.attendance.findMany({
      where,
      select: {
        attendanceId: true,
        attDate: true,
        timeIn: true,
        timeOut: true,
        inSource: true,
        outSource: true,
        status: true,
        totalMinutes: true,
        isManual: true,
        verifiedAt: true,
        approvedAt: true,
        employee: {
          select: {
            empNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
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
        verifiedBy: {
          select: {
            username: true,
          },
        },
        approvedBy: {
          select: {
            username: true,
          },
        },
        logs: {
          where: {
            source: "MANUAL",
            punchType: {
              in: ["MANUAL_EDIT", "CORRECTION"],
            },
          },
          select: {
            punchType: true,
            source: true,
            punchedAt: true,
            remarks: true,
            reason: true,
          },
          orderBy: {
            punchedAt: "desc",
          },
          take: 3,
        },
      },
      orderBy: [
        {
          approvedAt: "asc",
        },
        {
          verifiedAt: "asc",
        },
        {
          updatedAt: "desc",
        },
        {
          attendanceId: "desc",
        },
      ],
      skip,
      take: filters.pageSize,
    }),

    prisma.attendance.count({
      where,
    }),

    prisma.attendance.count({
      where: reviewRequiredWhere,
    }),

    prisma.attendance.count({
      where: {
        AND: [
          reviewRequiredWhere,
          {
            approvedAt: null,
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          reviewRequiredWhere,
          {
            verifiedAt: {
              not: null,
            },
            approvedAt: null,
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          reviewRequiredWhere,
          {
            approvedAt: {
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
    records: records.map(mapReviewQueueItem),
    summary: {
      totalReviewRequired,
      openReview,
      verifiedNotApproved,
      approved,
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