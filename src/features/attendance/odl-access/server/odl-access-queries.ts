import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  OdlAccessEmployeeItem,
  OdlAccessFilterValue,
  OdlAccessFilters,
  OdlAccessResult,
} from "../types/odl-access-types";

const DEFAULT_PAGE_SIZE = 15;

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

function normalizeAccess(value: string): OdlAccessFilterValue {
  const normalized = value.trim().toUpperCase();

  if (
    normalized === "ALL" ||
    normalized === "ENABLED" ||
    normalized === "DISABLED"
  ) {
    return normalized;
  }

  return "ALL";
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function buildOdlAccessWhere(
  filters: OdlAccessFilters,
): Prisma.EmployeeWhereInput {
  const andConditions: Prisma.EmployeeWhereInput[] = [];

  if (filters.access === "ENABLED") {
    andConditions.push({
      isFlexible: true,
    });
  }

  if (filters.access === "DISABLED") {
    andConditions.push({
      isFlexible: false,
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
          department: {
            name: {
              contains: filters.q,
            },
          },
        },
        {
          designation: {
            name: {
              contains: filters.q,
            },
          },
        },
        {
          empType: {
            name: {
              contains: filters.q,
            },
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
          schedule: {
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

function mapOdlAccessEmployee(input: {
  empId: number;
  empNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  status: string;
  isFlexible: boolean;
  department: {
    name: string;
  } | null;
  designation: {
    name: string;
  } | null;
  empType: {
    name: string;
  } | null;
  branch: {
    name: string;
  };
  schedule: {
    scheduleCode: string;
    name: string;
  } | null;
}): OdlAccessEmployeeItem {
  return {
    empId: input.empId,
    empNumber: input.empNumber,
    fullName: formatFullName({
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
    }),
    status: input.status,
    departmentName: dash(input.department?.name),
    designationName: dash(input.designation?.name),
    employeeTypeName: dash(input.empType?.name),
    branchName: input.branch.name,
    scheduleName: input.schedule
      ? `${input.schedule.scheduleCode} · ${input.schedule.name}`
      : "—",
    isFlexible: input.isFlexible,
  };
}

export function parseOdlAccessSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): OdlAccessFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    access: normalizeAccess(singleSearchParam(searchParams.access, "ALL")),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getOdlAccessData(
  filters: OdlAccessFilters,
): Promise<OdlAccessResult> {
  const where = buildOdlAccessWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    records,
    totalItems,
    totalEmployees,
    enabledOdlEmployees,
    disabledOdlEmployees,
    activeEnabledOdlEmployees,
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
        isFlexible: true,
        department: {
          select: {
            name: true,
          },
        },
        designation: {
          select: {
            name: true,
          },
        },
        empType: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            name: true,
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
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
        {
          empId: "asc",
        },
      ],
      skip,
      take: filters.pageSize,
    }),

    prisma.employee.count({
      where,
    }),

    prisma.employee.count(),

    prisma.employee.count({
      where: {
        isFlexible: true,
      },
    }),

    prisma.employee.count({
      where: {
        isFlexible: false,
      },
    }),

    prisma.employee.count({
      where: {
        isFlexible: true,
        status: "ACTIVE",
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    filters,
    records: records.map(mapOdlAccessEmployee),
    summary: {
      totalEmployees,
      enabledOdlEmployees,
      disabledOdlEmployees,
      activeEnabledOdlEmployees,
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