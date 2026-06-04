import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  OdlAccessBulkAccessFilter,
  OdlAccessBulkFilters,
  OdlAccessBulkOptions,
  OdlAccessBulkPreview,
} from "../types/odl-access-bulk-types";

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

function normalizeAccess(value: string): OdlAccessBulkAccessFilter {
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

function normalizeActiveOnly(value: string): boolean {
  return value !== "false";
}

export function parseOdlAccessBulkFilters(
  searchParams: Record<string, string | string[] | undefined>,
): OdlAccessBulkFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    branchId: singleSearchParam(searchParams.branchId),
    departmentId: singleSearchParam(searchParams.departmentId),
    designationId: singleSearchParam(searchParams.designationId),
    empTypeId: singleSearchParam(searchParams.empTypeId),
    scheduleId: singleSearchParam(searchParams.scheduleId),
    access: normalizeAccess(singleSearchParam(searchParams.access, "ALL")),
    activeOnly: normalizeActiveOnly(
      singleSearchParam(searchParams.activeOnly, "true"),
    ),
  };
}

export function hasOdlAccessBulkSpecificFilters(
  filters: OdlAccessBulkFilters,
): boolean {
  return Boolean(
    filters.q ||
      filters.branchId ||
      filters.departmentId ||
      filters.designationId ||
      filters.empTypeId ||
      filters.scheduleId ||
      filters.access !== "ALL" ||
      filters.activeOnly,
  );
}

export function buildOdlAccessBulkWhere(
  filters: OdlAccessBulkFilters,
): Prisma.EmployeeWhereInput {
  const andConditions: Prisma.EmployeeWhereInput[] = [];

  const branchId = parsePositiveId(filters.branchId);
  const departmentId = parsePositiveId(filters.departmentId);
  const designationId = parsePositiveId(filters.designationId);
  const empTypeId = parsePositiveId(filters.empTypeId);
  const scheduleId = parsePositiveId(filters.scheduleId);

  if (filters.activeOnly) {
    andConditions.push({
      status: "ACTIVE",
    });
  }

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

  if (designationId) {
    andConditions.push({
      designationId,
    });
  }

  if (empTypeId) {
    andConditions.push({
      empTypeId,
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

export async function getOdlAccessBulkOptions(): Promise<OdlAccessBulkOptions> {
  const [branches, departments, designations, employeeTypes, schedules] =
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

      prisma.designation.findMany({
        select: {
          designationId: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.empType.findMany({
        select: {
          empTypeId: true,
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
    designations: designations.map((designation) => ({
      id: designation.designationId,
      label: designation.name,
    })),
    employeeTypes: employeeTypes.map((employeeType) => ({
      id: employeeType.empTypeId,
      label: employeeType.name,
    })),
    schedules: schedules.map((schedule) => ({
      id: schedule.scheduleId,
      label: `${schedule.scheduleCode} · ${schedule.name}`,
    })),
  };
}

export async function getOdlAccessBulkPreview(
  filters: OdlAccessBulkFilters,
): Promise<OdlAccessBulkPreview> {
  const where = buildOdlAccessBulkWhere(filters);

  const [
    matchingEmployees,
    matchingEnabled,
    matchingDisabled,
    activeMatchingEmployees,
    wouldEnableCount,
    wouldDisableCount,
  ] = await Promise.all([
    prisma.employee.count({
      where,
    }),

    prisma.employee.count({
      where: {
        AND: [
          where,
          {
            isFlexible: true,
          },
        ],
      },
    }),

    prisma.employee.count({
      where: {
        AND: [
          where,
          {
            isFlexible: false,
          },
        ],
      },
    }),

    prisma.employee.count({
      where: {
        AND: [
          where,
          {
            status: "ACTIVE",
          },
        ],
      },
    }),

    prisma.employee.count({
      where: {
        AND: [
          where,
          {
            isFlexible: false,
          },
        ],
      },
    }),

    prisma.employee.count({
      where: {
        AND: [
          where,
          {
            isFlexible: true,
          },
        ],
      },
    }),
  ]);

  return {
    matchingEmployees,
    matchingEnabled,
    matchingDisabled,
    activeMatchingEmployees,
    wouldEnableCount,
    wouldDisableCount,
    hasSpecificFilters: hasOdlAccessBulkSpecificFilters(filters),
  };
}