import type {
  AttendanceExceptionType,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  AttendanceExceptionFilters,
  AttendanceExceptionItem,
  AttendanceExceptionOptions,
  AttendanceExceptionResult,
} from "../types/attendance-exception-types";

function singleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
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

function normalizeActiveOnly(value: string): boolean {
  return value !== "false";
}

function normalizeExceptionType(
  value: string,
): AttendanceExceptionType | undefined {
  const normalized = value.trim().toUpperCase();

  if (
    normalized === "HOLIDAY" ||
    normalized === "CLASS_SUSPENSION" ||
    normalized === "NO_WORK" ||
    normalized === "SCHOOL_EVENT" ||
    normalized === "REST_DAY" ||
    normalized === "OTHER"
  ) {
    return normalized;
  }

  return undefined;
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

function buildAttendanceExceptionWhere(
  filters: AttendanceExceptionFilters,
): Prisma.AttendanceExceptionDateWhereInput {
  const andConditions: Prisma.AttendanceExceptionDateWhereInput[] = [];

  const branchId = parsePositiveId(filters.branchId);
  const exceptionType = normalizeExceptionType(filters.type);
  const dateFrom = dateInputToStartDate(filters.dateFrom);
  const dateTo = dateInputToEndDate(filters.dateTo);

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

  if (exceptionType) {
    andConditions.push({
      exceptionType,
    });
  }

  if (dateFrom || dateTo) {
    andConditions.push({
      exceptionDate: {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lt: dateTo } : {}),
      },
    });
  }

  if (filters.q) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: filters.q,
          },
        },
        {
          description: {
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

export function parseAttendanceExceptionSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AttendanceExceptionFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    branchId: singleSearchParam(searchParams.branchId),
    type: singleSearchParam(searchParams.type),
    dateFrom: singleSearchParam(searchParams.dateFrom, getManilaDateInputValue(-30)),
    dateTo: singleSearchParam(searchParams.dateTo, getManilaDateInputValue(30)),
    activeOnly: normalizeActiveOnly(
      singleSearchParam(searchParams.activeOnly, "true"),
    ),
  };
}

export async function getAttendanceExceptionOptions(): Promise<AttendanceExceptionOptions> {
  const branches = await prisma.branch.findMany({
    select: {
      branchId: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    branches: branches.map((branch) => ({
      id: branch.branchId,
      label: branch.name,
    })),
  };
}

export async function getAttendanceExceptionData(
  filters: AttendanceExceptionFilters,
): Promise<AttendanceExceptionResult> {
  const where = buildAttendanceExceptionWhere(filters);

  const [records, options, totalActiveExceptions, totalMatchingExceptions, affectsAbsenceGeneration] =
    await Promise.all([
      prisma.attendanceExceptionDate.findMany({
        where,
        select: {
          exceptionId: true,
          exceptionDate: true,
          branchId: true,
          exceptionType: true,
          title: true,
          description: true,
          affectsAbsenceGeneration: true,
          status: true,
          createdAt: true,
        },
        orderBy: [
          {
            exceptionDate: "desc",
          },
          {
            exceptionId: "desc",
          },
        ],
        take: 100,
      }),

      getAttendanceExceptionOptions(),

      prisma.attendanceExceptionDate.count({
        where: {
          status: "ACTIVE",
        },
      }),

      prisma.attendanceExceptionDate.count({
        where,
      }),

      prisma.attendanceExceptionDate.count({
        where: {
          AND: [
            where,
            {
              affectsAbsenceGeneration: true,
            },
          ],
        },
      }),
    ]);

  const branchIds = Array.from(
    new Set(
      records
        .map((record) => record.branchId)
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

  const mappedRecords: AttendanceExceptionItem[] = records.map((record) => ({
    exceptionId: record.exceptionId,
    exceptionDate: formatDate(record.exceptionDate),
    branchName: record.branchId
      ? branchMap.get(record.branchId) ?? `Branch #${record.branchId}`
      : "All branches",
    exceptionType: record.exceptionType,
    title: record.title,
    description: dash(record.description),
    affectsAbsenceGeneration: record.affectsAbsenceGeneration,
    status: record.status,
    createdAt: formatDateTime(record.createdAt),
  }));

  return {
    filters,
    options,
    records: mappedRecords,
    summary: {
      totalActiveExceptions,
      totalMatchingExceptions,
      affectsAbsenceGeneration,
      currentPageRecords: mappedRecords.length,
    },
  };
}