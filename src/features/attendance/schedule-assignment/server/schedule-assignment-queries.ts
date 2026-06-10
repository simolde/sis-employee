import type {
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  ScheduleAssignmentFilters,
  ScheduleAssignmentOptions,
  ScheduleAssignmentPreview,
} from "../types/schedule-assignment-types";

function singleSearchParam(
  value:
    | string
    | string[]
    | undefined,

  fallback = "",
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      fallback
    );
  }

  return (
    value ??
    fallback
  );
}

function parsePositiveId(
  value: string,
): number | null {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(
      parsed,
    ) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

function parseDateInput(
  value: string,
): Date | null {
  if (
    !/^\d{4}-\d{2}-\d{2}$/u.test(
      value,
    )
  ) {
    return null;
  }

  const date =
    new Date(
      `${value}T00:00:00.000Z`,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function normalizeActiveOnly(
  value: string,
): boolean {
  return value !==
    "false";
}

function todayInputValue(): string {
  const now =
    new Date();

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Manila",

        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(
      now,
    );

  const year =
    parts.find(
      (part) =>
        part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function isScheduleEffectiveOnDate(
  input: {
    effectiveFrom: Date;
    effectiveTo: Date | null;
    validFrom: Date;
  },
): boolean {
  if (
    input.validFrom <
    input.effectiveFrom
  ) {
    return false;
  }

  if (
    input.effectiveTo &&
    input.validFrom >
      input.effectiveTo
  ) {
    return false;
  }

  return true;
}

export function parseScheduleAssignmentFilters(
  searchParams: Record<
    string,
    string |
    string[] |
    undefined
  >,
): ScheduleAssignmentFilters {
  return {
    q:
      singleSearchParam(
        searchParams.q,
      ).trim(),

    branchId:
      singleSearchParam(
        searchParams.branchId,
      ),

    departmentId:
      singleSearchParam(
        searchParams.departmentId,
      ),

    designationId:
      singleSearchParam(
        searchParams.designationId,
      ),

    empTypeId:
      singleSearchParam(
        searchParams.empTypeId,
      ),

    currentScheduleId:
      singleSearchParam(
        searchParams.currentScheduleId,
      ),

    activeOnly:
      normalizeActiveOnly(
        singleSearchParam(
          searchParams.activeOnly,
          "true",
        ),
      ),

    targetScheduleId:
      singleSearchParam(
        searchParams.targetScheduleId,
      ),

    validFrom:
      singleSearchParam(
        searchParams.validFrom,
        todayInputValue(),
      ),

    remarks:
      singleSearchParam(
        searchParams.remarks,
      ),
  };
}

export function hasSpecificScheduleAssignmentFilters(
  filters:
    ScheduleAssignmentFilters,
): boolean {
  return Boolean(
    filters.q ||
      filters.branchId ||
      filters.departmentId ||
      filters.designationId ||
      filters.empTypeId ||
      filters.currentScheduleId,
  );
}

export function buildScheduleAssignmentWhere(
  filters:
    ScheduleAssignmentFilters,
): Prisma.EmployeeWhereInput {
  const andConditions:
    Prisma.EmployeeWhereInput[] =
    [];

  const branchId =
    parsePositiveId(
      filters.branchId,
    );

  const departmentId =
    parsePositiveId(
      filters.departmentId,
    );

  const designationId =
    parsePositiveId(
      filters.designationId,
    );

  const empTypeId =
    parsePositiveId(
      filters.empTypeId,
    );

  if (
    filters.activeOnly
  ) {
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

  if (
    filters.currentScheduleId ===
    "NONE"
  ) {
    andConditions.push({
      scheduleId: null,
    });
  } else {
    const currentScheduleId =
      parsePositiveId(
        filters.currentScheduleId,
      );

    if (currentScheduleId) {
      andConditions.push({
        scheduleId:
          currentScheduleId,
      });
    }
  }

  if (filters.q) {
    andConditions.push({
      OR: [
        {
          empNumber: {
            contains:
              filters.q,
          },
        },
        {
          firstName: {
            contains:
              filters.q,
          },
        },
        {
          middleName: {
            contains:
              filters.q,
          },
        },
        {
          lastName: {
            contains:
              filters.q,
          },
        },
        {
          department: {
            name: {
              contains:
                filters.q,
            },
          },
        },
        {
          designation: {
            name: {
              contains:
                filters.q,
            },
          },
        },
        {
          empType: {
            name: {
              contains:
                filters.q,
            },
          },
        },
        {
          branch: {
            name: {
              contains:
                filters.q,
            },
          },
        },
        {
          schedule: {
            name: {
              contains:
                filters.q,
            },
          },
        },
        {
          schedule: {
            scheduleCode: {
              contains:
                filters.q,
            },
          },
        },
      ],
    });
  }

  if (
    andConditions.length ===
    0
  ) {
    return {};
  }

  return {
    AND:
      andConditions,
  };
}

export async function getScheduleAssignmentOptions(): Promise<ScheduleAssignmentOptions> {
  const [
    branches,
    departments,
    designations,
    employeeTypes,
    schedules,
  ] =
    await Promise.all([
      prisma.branch.findMany({
        where: {
          status:
            "ACTIVE",
        },

        select: {
          branchId: true,
          name: true,
        },

        orderBy: {
          name: "asc",
        },
      }),

      prisma.department.findMany({
        where: {
          status:
            "ACTIVE",
        },

        select: {
          departmentId:
            true,

          name: true,
        },

        orderBy: {
          name: "asc",
        },
      }),

      prisma.designation.findMany({
        where: {
          status:
            "ACTIVE",
        },

        select: {
          designationId:
            true,

          name: true,
        },

        orderBy: {
          name: "asc",
        },
      }),

      prisma.empType.findMany({
        where: {
          status:
            "ACTIVE",
        },

        select: {
          empTypeId:
            true,

          name: true,
        },

        orderBy: {
          name: "asc",
        },
      }),

      prisma.shiftSchedule.findMany({
        where: {
          status:
            "ACTIVE",

          shift: {
            status:
              "ACTIVE",
          },
        },

        select: {
          scheduleId:
            true,

          scheduleCode:
            true,

          name: true,

          effectiveFrom:
            true,

          effectiveTo:
            true,

          shift: {
            select: {
              shiftCode:
                true,

              startTime:
                true,

              endTime:
                true,
            },
          },
        },

        orderBy: [
          {
            scheduleCode:
              "asc",
          },
          {
            name:
              "asc",
          },
        ],
      }),
    ]);

  return {
    branches:
      branches.map(
        (branch) => ({
          id:
            branch.branchId,

          label:
            branch.name,
        }),
      ),

    departments:
      departments.map(
        (department) => ({
          id:
            department.departmentId,

          label:
            department.name,
        }),
      ),

    designations:
      designations.map(
        (designation) => ({
          id:
            designation.designationId,

          label:
            designation.name,
        }),
      ),

    employeeTypes:
      employeeTypes.map(
        (employeeType) => ({
          id:
            employeeType.empTypeId,

          label:
            employeeType.name,
        }),
      ),

    schedules:
      schedules.map(
        (schedule) => ({
          id:
            schedule.scheduleId,

          label:
            `${schedule.scheduleCode} · ${schedule.name} · ${schedule.shift.shiftCode} (${schedule.shift.startTime.slice(
              0,
              5,
            )}-${schedule.shift.endTime.slice(
              0,
              5,
            )})`,
        }),
      ),
  };
}

export async function getScheduleAssignmentPreview(
  filters:
    ScheduleAssignmentFilters,
): Promise<ScheduleAssignmentPreview> {
  const where =
    buildScheduleAssignmentWhere(
      filters,
    );

  const targetScheduleId =
    parsePositiveId(
      filters.targetScheduleId,
    );

  const validFrom =
    parseDateInput(
      filters.validFrom,
    );

  const targetSchedule =
    targetScheduleId
      ? await prisma.shiftSchedule.findUnique({
          where: {
            scheduleId:
              targetScheduleId,
          },

          select: {
            scheduleCode:
              true,

            name: true,

            status: true,

            effectiveFrom:
              true,

            effectiveTo:
              true,

            shift: {
              select: {
                status:
                  true,
              },
            },
          },
        })
      : null;

  let targetScheduleIssue:
    string | null =
    null;

  if (
    targetScheduleId &&
    !targetSchedule
  ) {
    targetScheduleIssue =
      "Target schedule was not found.";
  } else if (
    targetSchedule &&
    targetSchedule.status !==
      "ACTIVE"
  ) {
    targetScheduleIssue =
      "Target schedule is not active.";
  } else if (
    targetSchedule &&
    targetSchedule.shift.status !==
      "ACTIVE"
  ) {
    targetScheduleIssue =
      "The target schedule's shift is not active.";
  } else if (
    targetSchedule &&
    validFrom &&
    !isScheduleEffectiveOnDate({
      effectiveFrom:
        targetSchedule.effectiveFrom,

      effectiveTo:
        targetSchedule.effectiveTo,

      validFrom,
    })
  ) {
    targetScheduleIssue =
      "The effective assignment date is outside the target schedule's effective date range.";
  } else if (
    targetSchedule &&
    !validFrom
  ) {
    targetScheduleIssue =
      "Select a valid effective assignment date.";
  }

  const targetScheduleAvailable =
    Boolean(
      targetScheduleId &&
      targetSchedule &&
      !targetScheduleIssue,
    );

  const [
    matchingEmployees,
    activeMatchingEmployees,
    employeesWithoutSchedule,
    alreadyTargetSchedule,
    scheduleChangeCount,
    historyRepairCount,
  ] =
    await Promise.all([
      prisma.employee.count({
        where,
      }),

      prisma.employee.count({
        where: {
          AND: [
            where,
            {
              status:
                "ACTIVE",
            },
          ],
        },
      }),

      prisma.employee.count({
        where: {
          AND: [
            where,
            {
              scheduleId:
                null,
            },
          ],
        },
      }),

      targetScheduleId
        ? prisma.employee.count({
            where: {
              AND: [
                where,
                {
                  scheduleId:
                    targetScheduleId,
                },
              ],
            },
          })
        : Promise.resolve(
            0,
          ),

      targetScheduleAvailable
        ? prisma.employee.count({
            where: {
              AND: [
                where,
                {
                  OR: [
                    {
                      scheduleId: {
                        not:
                          targetScheduleId,
                      },
                    },
                    {
                      scheduleId:
                        null,
                    },
                  ],
                },
              ],
            },
          })
        : Promise.resolve(
            0,
          ),

      targetScheduleAvailable
        ? prisma.employee.count({
            where: {
              AND: [
                where,
                {
                  scheduleId:
                    targetScheduleId,
                },
                {
                  employeeScheduleAssignments: {
                    none: {
                      isActive:
                        true,

                      scheduleId:
                        targetScheduleId,
                    },
                  },
                },
              ],
            },
          })
        : Promise.resolve(
            0,
          ),
    ]);

  return {
    matchingEmployees,
    activeMatchingEmployees,
    employeesWithoutSchedule,
    alreadyTargetSchedule,
    scheduleChangeCount,
    historyRepairCount,

    wouldAssignCount:
      scheduleChangeCount +
      historyRepairCount,

    hasSpecificFilters:
      hasSpecificScheduleAssignmentFilters(
        filters,
      ),

    targetScheduleLabel:
      targetSchedule
        ? `${targetSchedule.scheduleCode} · ${targetSchedule.name}`
        : "No target schedule selected",

    targetScheduleAvailable,
    targetScheduleIssue,
  };
}