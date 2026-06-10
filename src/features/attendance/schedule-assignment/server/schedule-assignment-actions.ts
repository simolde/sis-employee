"use server";

import type {
  Prisma,
} from "@/generated/prisma/client";
import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import type { ScheduleAssignmentActionState } from "../types/schedule-assignment-types";
import { bulkScheduleAssignmentValidationSchema } from "../validators/schedule-assignment-validation";
import {
  buildScheduleAssignmentWhere,
  hasSpecificScheduleAssignmentFilters,
  parseScheduleAssignmentFilters,
} from "./schedule-assignment-queries";

type ActiveAssignmentRecord = {
  assignmentId: number;
  scheduleId: number;
  validFrom: Date;
  validTo: Date | null;
  isActive: boolean;
};

type ScheduleAssignmentEmployee = {
  empId: number;
  empNumber: string;
  scheduleId: number | null;
  status: string;
  branchId: number;
  departmentId: number | null;
  designationId: number | null;
  empTypeId: number | null;
};

function formDataToRecord(
  formData: FormData,
): Record<
  string,
  string |
  string[] |
  undefined
> {
  const output: Record<
    string,
    string |
    string[] |
    undefined
  > = {};

  for (
    const [
      key,
      value,
    ] of formData.entries()
  ) {
    if (
      typeof value ===
      "string"
    ) {
      output[key] =
        value;
    }
  }

  return output;
}

function formDataToObject(
  formData: FormData,
): Record<
  string,
  FormDataEntryValue
> {
  return Object.fromEntries(
    formData.entries(),
  );
}

function subtractUtcDays(
  date: Date,
  days: number,
): Date {
  const result =
    new Date(date);

  result.setUTCDate(
    result.getUTCDate() -
      days,
  );

  return result;
}

function buildActiveAssignmentsAuditValue(
  assignments:
    ActiveAssignmentRecord[],
): Prisma.InputJsonArray {
  return assignments.map(
    (assignment) => ({
      assignmentId:
        assignment.assignmentId,

      scheduleId:
        assignment.scheduleId,

      validFrom:
        assignment.validFrom.toISOString(),

      validTo:
        assignment.validTo
          ?.toISOString() ??
        null,

      isActive:
        assignment.isActive,
    }),
  );
}

function buildEmployeeAuditValue(
  employee:
    ScheduleAssignmentEmployee,

  activeAssignments:
    ActiveAssignmentRecord[],
): Prisma.InputJsonObject {
  return {
    empId:
      employee.empId,

    empNumber:
      employee.empNumber,

    scheduleId:
      employee.scheduleId,

    status:
      employee.status,

    branchId:
      employee.branchId,

    departmentId:
      employee.departmentId,

    designationId:
      employee.designationId,

    empTypeId:
      employee.empTypeId,

    activeAssignments:
      buildActiveAssignmentsAuditValue(
        activeAssignments,
      ),
  };
}

function buildUpdatedEmployeeAuditValue(
  input: {
    employee:
      ScheduleAssignmentEmployee;

    assignmentId: number;

    previousValidTo:
      Date | null;

    nextScheduleId: number;
    validFrom: Date;
    remarks: string;
    repairOnly: boolean;
  },
): Prisma.InputJsonObject {
  return {
    ...buildEmployeeAuditValue(
      input.employee,
      [],
    ),

    scheduleId:
      input.nextScheduleId,

    assignmentId:
      input.assignmentId,

    validFrom:
      input.validFrom.toISOString(),

    validTo:
      null,

    previousValidTo:
      input.previousValidTo
        ?.toISOString() ??
      null,

    isActive:
      true,

    repairOnly:
      input.repairOnly,

    remarks:
      input.remarks ||
      null,

    dateSemantics: {
      validFrom:
        "INCLUSIVE",

      validTo:
        "INCLUSIVE",
    },
  };
}

function revalidateScheduleAssignmentPages(): void {
  revalidatePath(
    "/dashboard/attendance",
  );

  revalidatePath(
    "/dashboard/attendance/actions",
  );

  revalidatePath(
    "/dashboard/attendance/status-recalculation",
  );

  revalidatePath(
    "/dashboard/attendance/schedule-assignment",
  );

  revalidatePath(
    "/dashboard/attendance/schedule-assignment/history",
  );

  revalidatePath(
    "/dashboard/attendance/absences/candidates",
  );

  revalidatePath(
    "/dashboard/employees",
  );
}

export async function bulkAssignEmployeeScheduleAction(
  _previousState:
    ScheduleAssignmentActionState,

  formData: FormData,
): Promise<ScheduleAssignmentActionState> {
  const session =
    await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (
    !canManageEmployees(
      session.role,
    )
  ) {
    return {
      ok: false,

      message:
        "You do not have permission to assign employee schedules.",
    };
  }

  const parsed =
    bulkScheduleAssignmentValidationSchema.safeParse(
      formDataToObject(
        formData,
      ),
    );

  if (!parsed.success) {
    return {
      ok: false,

      message:
        "Review the highlighted schedule assignment fields.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const data =
    parsed.data;

  const filters =
    parseScheduleAssignmentFilters(
      formDataToRecord(
        formData,
      ),
    );

  if (
    !hasSpecificScheduleAssignmentFilters(
      filters,
    ) &&
    !data.confirmAll
  ) {
    return {
      ok: false,

      message:
        "Choose at least one filter, or confirm that the assignment should apply to all matching employees.",

      fieldErrors: {
        confirmAll: [
          "Confirmation is required when no filters are selected.",
        ],
      },
    };
  }

  const targetSchedule =
    await prisma.shiftSchedule.findFirst({
      where: {
        scheduleId:
          data.targetScheduleId,

        status:
          "ACTIVE",

        shift: {
          status:
            "ACTIVE",
        },

        effectiveFrom: {
          lte:
            data.validFrom,
        },

        OR: [
          {
            effectiveTo:
              null,
          },
          {
            effectiveTo: {
              gte:
                data.validFrom,
            },
          },
        ],
      },

      select: {
        scheduleId: true,
        scheduleCode: true,
        name: true,
        effectiveFrom: true,
        effectiveTo: true,

        shift: {
          select: {
            shiftCode: true,
            name: true,
          },
        },
      },
    });

  if (!targetSchedule) {
    return {
      ok: false,

      message:
        "The target schedule is inactive, its shift is inactive, or the effective date is outside its allowed date range.",

      fieldErrors: {
        targetScheduleId: [
          "Select an active schedule with an active shift.",
        ],

        validFrom: [
          "The date must fall within the target schedule's effective period.",
        ],
      },
    };
  }

  const where =
    buildScheduleAssignmentWhere(
      filters,
    );

  const processWhere:
    Prisma.EmployeeWhereInput =
    {
      AND: [
        where,
        {
          OR: [
            {
              scheduleId: {
                not:
                  data.targetScheduleId,
              },
            },
            {
              scheduleId:
                null,
            },
            {
              AND: [
                {
                  scheduleId:
                    data.targetScheduleId,
                },
                {
                  employeeScheduleAssignments: {
                    none: {
                      isActive:
                        true,

                      scheduleId:
                        data.targetScheduleId,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

  const result =
    await prisma.$transaction(
      async (tx) => {
        /*
         * The candidate query is only a preview of work.
         * Each employee is locked and re-read before mutation.
         */
        const candidates =
          await tx.employee.findMany({
            where:
              processWhere,

            select: {
              empId: true,
            },

            orderBy: [
              {
                lastName:
                  "asc",
              },
              {
                firstName:
                  "asc",
              },
              {
                empId:
                  "asc",
              },
            ],

            take:
              data.limit,
          });

        let scheduleChangedCount =
          0;

        let historyRepairedCount =
          0;

        let invalidEffectiveDateCount =
          0;

        let skippedCount =
          0;

        for (
          const candidate of
          candidates
        ) {
          /*
           * MySQL row lock serializes schedule changes for
           * the same employee during this transaction.
           */
          await tx.$queryRaw<
            Array<{
              empId: number;
            }>
          >`
            SELECT
              emp_id AS empId
            FROM employees
            WHERE emp_id = ${candidate.empId}
            FOR UPDATE
          `;

          const employee =
            await tx.employee.findUnique({
              where: {
                empId:
                  candidate.empId,
              },

              select: {
                empId: true,
                empNumber: true,
                scheduleId: true,
                status: true,
                branchId: true,
                departmentId: true,
                designationId: true,
                empTypeId: true,

                employeeScheduleAssignments: {
                  where: {
                    isActive:
                      true,
                  },

                  select: {
                    assignmentId:
                      true,

                    scheduleId:
                      true,

                    validFrom:
                      true,

                    validTo:
                      true,

                    isActive:
                      true,
                  },

                  orderBy: [
                    {
                      validFrom:
                        "asc",
                    },
                    {
                      assignmentId:
                        "asc",
                    },
                  ],
                },
              },
            });

          if (!employee) {
            skippedCount +=
              1;

            continue;
          }

          const activeAssignments =
            employee.employeeScheduleAssignments;

          const alreadyHasTargetHistory =
            activeAssignments.some(
              (assignment) =>
                assignment.scheduleId ===
                data.targetScheduleId,
            );

          if (
            employee.scheduleId ===
              data.targetScheduleId &&
            alreadyHasTargetHistory
          ) {
            skippedCount +=
              1;

            continue;
          }

          const assignmentStartsTooLate =
            activeAssignments.some(
              (assignment) =>
                assignment.validFrom >=
                data.validFrom,
            );

          if (
            assignmentStartsTooLate
          ) {
            invalidEffectiveDateCount +=
              1;

            continue;
          }

          const previousValidTo =
            activeAssignments.length >
            0
              ? subtractUtcDays(
                  data.validFrom,
                  1,
                )
              : null;

          const oldEmployee:
            ScheduleAssignmentEmployee =
            {
              empId:
                employee.empId,

              empNumber:
                employee.empNumber,

              scheduleId:
                employee.scheduleId,

              status:
                employee.status,

              branchId:
                employee.branchId,

              departmentId:
                employee.departmentId,

              designationId:
                employee.designationId,

              empTypeId:
                employee.empTypeId,
            };

          const repairOnly =
            employee.scheduleId ===
            data.targetScheduleId;

          if (
            activeAssignments.length >
            0
          ) {
            await tx.employeeScheduleAssignment.updateMany({
              where: {
                empId:
                  employee.empId,

                isActive:
                  true,
              },

              data: {
                isActive:
                  false,

                validTo:
                  previousValidTo,
              },
            });
          }

          if (!repairOnly) {
            await tx.employee.update({
              where: {
                empId:
                  employee.empId,
              },

              data: {
                scheduleId:
                  data.targetScheduleId,
              },
            });
          }

          const remarks =
            data.remarks ||
            (
              repairOnly
                ? `Repaired missing active history for ${targetSchedule.scheduleCode} · ${targetSchedule.name}`
                : `Bulk assigned to ${targetSchedule.scheduleCode} · ${targetSchedule.name}`
            );

          const assignment =
            await tx.employeeScheduleAssignment.create({
              data: {
                empId:
                  employee.empId,

                scheduleId:
                  data.targetScheduleId,

                validFrom:
                  data.validFrom,

                validTo:
                  null,

                isActive:
                  true,

                assignedById:
                  session.userId,

                remarks,
              },

              select: {
                assignmentId:
                  true,
              },
            });

          await tx.activityLog.create({
            data: {
              actorUserId:
                session.userId,

              action:
                repairOnly
                  ? "EMPLOYEE_SCHEDULE_HISTORY_REPAIRED_V1"
                  : "EMPLOYEE_SCHEDULE_BULK_ASSIGNED_V2",

              entityType:
                "employee",

              entityId:
                String(
                  employee.empId,
                ),

              oldValue:
                buildEmployeeAuditValue(
                  oldEmployee,
                  activeAssignments,
                ),

              newValue:
                buildUpdatedEmployeeAuditValue({
                  employee:
                    oldEmployee,

                  assignmentId:
                    assignment.assignmentId,

                  previousValidTo,

                  nextScheduleId:
                    data.targetScheduleId,

                  validFrom:
                    data.validFrom,

                  remarks,

                  repairOnly,
                }),
            },
          });

          if (repairOnly) {
            historyRepairedCount +=
              1;
          } else {
            scheduleChangedCount +=
              1;
          }
        }

        return {
          matchedCount:
            candidates.length,

          scheduleChangedCount,

          historyRepairedCount,

          invalidEffectiveDateCount,

          skippedCount,

          updatedCount:
            scheduleChangedCount +
            historyRepairedCount,
        };
      },
    );

  revalidateScheduleAssignmentPages();

  const detailParts = [
    `${result.scheduleChangedCount} schedule change(s)`,
    `${result.historyRepairedCount} history repair(s)`,
  ];

  if (
    result.invalidEffectiveDateCount >
    0
  ) {
    detailParts.push(
      `${result.invalidEffectiveDateCount} skipped because the new date was not later than the active assignment start`,
    );
  }

  if (
    result.skippedCount >
    0
  ) {
    detailParts.push(
      `${result.skippedCount} unchanged`,
    );
  }

  return {
    ok:
      result.updatedCount >
      0,

    matchedCount:
      result.matchedCount,

    updatedCount:
      result.updatedCount,

    scheduleChangedCount:
      result.scheduleChangedCount,

    historyRepairedCount:
      result.historyRepairedCount,

    invalidEffectiveDateCount:
      result.invalidEffectiveDateCount,

    skippedCount:
      result.skippedCount,

    message:
      result.updatedCount >
      0
        ? `${targetSchedule.scheduleCode} · ${targetSchedule.name}: ${detailParts.join(
            ", ",
          )}.`
        : `No records were changed. ${detailParts.join(
            ", ",
          )}.`,
  };
}