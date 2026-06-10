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
import { canManageSettings } from "@/lib/security/roles";
import type { ScheduleSetupActionState } from "../types/schedule-setup-types";
import {
  createScheduleValidationSchema,
  createShiftValidationSchema,
  updateScheduleValidationSchema,
  updateShiftValidationSchema,
} from "../validators/schedule-setup-validation";

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

async function requireSettingsManager() {
  const session =
    await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (
    !canManageSettings(
      session.role,
    )
  ) {
    return null;
  }

  return session;
}

function isUniqueConstraintError(
  error: unknown,
): boolean {
  return (
    typeof error ===
      "object" &&
    error !== null &&
    (
      error as {
        code?: unknown;
      }
    ).code ===
      "P2002"
  );
}

function sameDate(
  first:
    | Date
    | null,

  second:
    | Date
    | null,
): boolean {
  if (
    first === null ||
    second === null
  ) {
    return (
      first === second
    );
  }

  return (
    first.getTime() ===
    second.getTime()
  );
}

function buildShiftAuditValue(
  input: {
    shiftId: number;
    shiftCode: string;
    name: string;
    startTime: string;
    endTime: string;
    graceMinutes: number;
    isOvernight: boolean;
    status: string;
  },
): Prisma.InputJsonObject {
  return {
    shiftId:
      input.shiftId,

    shiftCode:
      input.shiftCode,

    name:
      input.name,

    startTime:
      input.startTime,

    endTime:
      input.endTime,

    graceMinutes:
      input.graceMinutes,

    isOvernight:
      input.isOvernight,

    status:
      input.status,
  };
}

function buildScheduleAuditValue(
  input: {
    scheduleId: number;
    scheduleCode: string;
    name: string;
    shiftId: number;
    daysOfWeek:
      string | null;
    effectiveFrom: Date;
    effectiveTo:
      Date | null;
    status: string;
  },
): Prisma.InputJsonObject {
  return {
    scheduleId:
      input.scheduleId,

    scheduleCode:
      input.scheduleCode,

    name:
      input.name,

    shiftId:
      input.shiftId,

    daysOfWeek:
      input.daysOfWeek,

    effectiveFrom:
      input.effectiveFrom.toISOString(),

    effectiveTo:
      input.effectiveTo
        ?.toISOString() ??
      null,

    status:
      input.status,
  };
}

const shiftAuditSelect = {
  shiftId: true,
  shiftCode: true,
  name: true,
  startTime: true,
  endTime: true,
  graceMinutes: true,
  isOvernight: true,
  status: true,
} satisfies Prisma.ShiftSelect;

const shiftInspectionSelect = {
  ...shiftAuditSelect,

  schedules: {
    select: {
      status: true,

      _count: {
        select: {
          currentEmployees:
            true,

          employeeAssignments:
            true,

          attendanceRecords:
            true,
        },
      },
    },
  },
} satisfies Prisma.ShiftSelect;

const scheduleAuditSelect = {
  scheduleId: true,
  scheduleCode: true,
  name: true,
  shiftId: true,
  daysOfWeek: true,
  effectiveFrom: true,
  effectiveTo: true,
  status: true,
} satisfies Prisma.ShiftScheduleSelect;

const scheduleInspectionSelect = {
  ...scheduleAuditSelect,

  shift: {
    select: {
      status: true,
    },
  },

  _count: {
    select: {
      currentEmployees:
        true,

      employeeAssignments:
        true,

      attendanceRecords:
        true,
    },
  },

  employeeAssignments: {
    where: {
      isActive:
        true,
    },

    select: {
      assignmentId:
        true,
    },
  },
} satisfies Prisma.ShiftScheduleSelect;

function revalidateScheduleSetupPages(): void {
  revalidatePath(
    "/dashboard/settings",
  );

  revalidatePath(
    "/dashboard/settings/shifts",
  );

  revalidatePath(
    "/dashboard/settings/schedules",
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
    "/dashboard/attendance/status-recalculation",
  );
}

export async function createShiftAction(
  _previousState:
    ScheduleSetupActionState,

  formData: FormData,
): Promise<ScheduleSetupActionState> {
  const session =
    await requireSettingsManager();

  if (!session) {
    return {
      ok: false,

      message:
        "You do not have permission to manage shifts.",
    };
  }

  const parsed =
    createShiftValidationSchema.safeParse(
      formDataToObject(
        formData,
      ),
    );

  if (!parsed.success) {
    return {
      ok: false,

      message:
        "Please review the highlighted fields.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const data =
    parsed.data;

  const duplicate =
    await prisma.shift.findFirst({
      where: {
        OR: [
          {
            shiftCode:
              data.shiftCode,
          },
          {
            name:
              data.name,
          },
        ],
      },

      select: {
        shiftCode: true,
        name: true,
      },
    });

  if (duplicate) {
    return {
      ok: false,

      message:
        "Shift code or name already exists.",

      fieldErrors: {
        shiftCode:
          duplicate.shiftCode ===
          data.shiftCode
            ? [
                "Shift code already exists.",
              ]
            : undefined,

        name:
          duplicate.name ===
          data.name
            ? [
                "Shift name already exists.",
              ]
            : undefined,
      },
    };
  }

  try {
    const shift =
      await prisma.$transaction(
        async (tx) => {
          const createdShift =
            await tx.shift.create({
              data: {
                shiftCode:
                  data.shiftCode,

                name:
                  data.name,

                startTime:
                  data.startTime,

                endTime:
                  data.endTime,

                graceMinutes:
                  data.graceMinutes,

                isOvernight:
                  data.isOvernight,

                status:
                  "ACTIVE",
              },

              select:
                shiftAuditSelect,
            });

          await tx.activityLog.create({
            data: {
              actorUserId:
                session.userId,

              action:
                "SHIFT_CREATED",

              entityType:
                "shift",

              entityId:
                String(
                  createdShift.shiftId,
                ),

              newValue:
                buildShiftAuditValue(
                  createdShift,
                ),
            },
          });

          return createdShift;
        },
      );

    revalidateScheduleSetupPages();

    return {
      ok: true,

      message:
        `${shift.name} created successfully.`,
    };
  } catch (error) {
    if (
      isUniqueConstraintError(
        error,
      )
    ) {
      return {
        ok: false,

        message:
          "Shift code already exists.",

        fieldErrors: {
          shiftCode: [
            "Shift code already exists.",
          ],
        },
      };
    }

    throw error;
  }
}

export async function updateShiftAction(
  _previousState:
    ScheduleSetupActionState,

  formData: FormData,
): Promise<ScheduleSetupActionState> {
  const session =
    await requireSettingsManager();

  if (!session) {
    return {
      ok: false,

      message:
        "You do not have permission to manage shifts.",
    };
  }

  const parsed =
    updateShiftValidationSchema.safeParse(
      formDataToObject(
        formData,
      ),
    );

  if (!parsed.success) {
    return {
      ok: false,

      message:
        "Please review the highlighted fields.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const data =
    parsed.data;

  const existingShift =
    await prisma.shift.findUnique({
      where: {
        shiftId:
          data.shiftId,
      },

      select:
        shiftInspectionSelect,
    });

  if (!existingShift) {
    return {
      ok: false,

      message:
        "Shift was not found.",
    };
  }

  const currentEmployeeCount =
    existingShift.schedules.reduce(
      (
        total,
        schedule,
      ) =>
        total +
        schedule._count
          .currentEmployees,
      0,
    );

  const assignmentHistoryCount =
    existingShift.schedules.reduce(
      (
        total,
        schedule,
      ) =>
        total +
        schedule._count
          .employeeAssignments,
      0,
    );

  const attendanceCount =
    existingShift.schedules.reduce(
      (
        total,
        schedule,
      ) =>
        total +
        schedule._count
          .attendanceRecords,
      0,
    );

  const activeScheduleCount =
    existingShift.schedules.filter(
      (schedule) =>
        schedule.status ===
        "ACTIVE",
    ).length;

  const ruleEditingLocked =
    currentEmployeeCount >
      0 ||
    assignmentHistoryCount >
      0 ||
    attendanceCount >
      0;

  const coreRulesChanged =
    existingShift.startTime !==
      data.startTime ||
    existingShift.endTime !==
      data.endTime ||
    existingShift.graceMinutes !==
      data.graceMinutes ||
    existingShift.isOvernight !==
      data.isOvernight;

  if (
    ruleEditingLocked &&
    coreRulesChanged
  ) {
    const ruleMessage =
      "This shift already affects employees, assignment history, or attendance records. Create a new shift for future time-rule changes.";

    return {
      ok: false,
      message:
        ruleMessage,

      fieldErrors: {
        startTime: [
          ruleMessage,
        ],

        endTime: [
          ruleMessage,
        ],

        graceMinutes: [
          ruleMessage,
        ],

        isOvernight: [
          ruleMessage,
        ],
      },
    };
  }

  if (
    existingShift.status ===
      "ACTIVE" &&
    data.status !==
      "ACTIVE" &&
    activeScheduleCount >
      0
  ) {
    return {
      ok: false,

      message:
        "This shift cannot be deactivated or archived while active schedules depend on it.",

      fieldErrors: {
        status: [
          "Deactivate or move the active schedules first.",
        ],
      },
    };
  }

  const duplicate =
    await prisma.shift.findFirst({
      where: {
        shiftId: {
          not:
            data.shiftId,
        },

        OR: [
          {
            shiftCode:
              data.shiftCode,
          },
          {
            name:
              data.name,
          },
        ],
      },

      select: {
        shiftCode: true,
        name: true,
      },
    });

  if (duplicate) {
    return {
      ok: false,

      message:
        "Shift code or name already exists.",

      fieldErrors: {
        shiftCode:
          duplicate.shiftCode ===
          data.shiftCode
            ? [
                "Shift code already exists.",
              ]
            : undefined,

        name:
          duplicate.name ===
          data.name
            ? [
                "Shift name already exists.",
              ]
            : undefined,
      },
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const updatedShift =
          await tx.shift.update({
            where: {
              shiftId:
                data.shiftId,
            },

            data: {
              shiftCode:
                data.shiftCode,

              name:
                data.name,

              startTime:
                data.startTime,

              endTime:
                data.endTime,

              graceMinutes:
                data.graceMinutes,

              isOvernight:
                data.isOvernight,

              status:
                data.status,
            },

            select:
              shiftAuditSelect,
          });

        await tx.activityLog.create({
          data: {
            actorUserId:
              session.userId,

            action:
              "SHIFT_UPDATED",

            entityType:
              "shift",

            entityId:
              String(
                updatedShift.shiftId,
              ),

            oldValue:
              buildShiftAuditValue(
                existingShift,
              ),

            newValue: {
              ...buildShiftAuditValue(
                updatedShift,
              ),

              dependencyProtection: {
                currentEmployeeCount,
                assignmentHistoryCount,
                attendanceCount,
                activeScheduleCount,
                coreRulesLocked:
                  ruleEditingLocked,
              },
            },
          },
        });
      },
    );

    revalidateScheduleSetupPages();

    return {
      ok: true,

      message:
        "Shift updated successfully.",
    };
  } catch (error) {
    if (
      isUniqueConstraintError(
        error,
      )
    ) {
      return {
        ok: false,

        message:
          "Shift code already exists.",

        fieldErrors: {
          shiftCode: [
            "Shift code already exists.",
          ],
        },
      };
    }

    throw error;
  }
}

export async function createScheduleAction(
  _previousState:
    ScheduleSetupActionState,

  formData: FormData,
): Promise<ScheduleSetupActionState> {
  const session =
    await requireSettingsManager();

  if (!session) {
    return {
      ok: false,

      message:
        "You do not have permission to manage schedules.",
    };
  }

  const parsed =
    createScheduleValidationSchema.safeParse(
      formDataToObject(
        formData,
      ),
    );

  if (!parsed.success) {
    return {
      ok: false,

      message:
        "Please review the highlighted fields.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const data =
    parsed.data;

  const activeShift =
    await prisma.shift.findFirst({
      where: {
        shiftId:
          data.shiftId,

        status:
          "ACTIVE",
      },

      select: {
        shiftId: true,
      },
    });

  if (!activeShift) {
    return {
      ok: false,

      message:
        "Selected shift is not active or does not exist.",

      fieldErrors: {
        shiftId: [
          "Selected shift is not active or does not exist.",
        ],
      },
    };
  }

  const duplicate =
    await prisma.shiftSchedule.findFirst({
      where: {
        OR: [
          {
            scheduleCode:
              data.scheduleCode,
          },
          {
            name:
              data.name,
          },
        ],
      },

      select: {
        scheduleCode: true,
        name: true,
      },
    });

  if (duplicate) {
    return {
      ok: false,

      message:
        "Schedule code or name already exists.",

      fieldErrors: {
        scheduleCode:
          duplicate.scheduleCode ===
          data.scheduleCode
            ? [
                "Schedule code already exists.",
              ]
            : undefined,

        name:
          duplicate.name ===
          data.name
            ? [
                "Schedule name already exists.",
              ]
            : undefined,
      },
    };
  }

  try {
    const schedule =
      await prisma.$transaction(
        async (tx) => {
          const createdSchedule =
            await tx.shiftSchedule.create({
              data: {
                scheduleCode:
                  data.scheduleCode,

                name:
                  data.name,

                shiftId:
                  data.shiftId,

                daysOfWeek:
                  data.daysOfWeek,

                effectiveFrom:
                  data.effectiveFrom,

                effectiveTo:
                  data.effectiveTo,

                status:
                  "ACTIVE",
              },

              select:
                scheduleAuditSelect,
            });

          await tx.activityLog.create({
            data: {
              actorUserId:
                session.userId,

              action:
                "SCHEDULE_CREATED",

              entityType:
                "shift_schedule",

              entityId:
                String(
                  createdSchedule.scheduleId,
                ),

              newValue:
                buildScheduleAuditValue(
                  createdSchedule,
                ),
            },
          });

          return createdSchedule;
        },
      );

    revalidateScheduleSetupPages();

    return {
      ok: true,

      message:
        `${schedule.name} created successfully.`,
    };
  } catch (error) {
    if (
      isUniqueConstraintError(
        error,
      )
    ) {
      return {
        ok: false,

        message:
          "Schedule code already exists.",

        fieldErrors: {
          scheduleCode: [
            "Schedule code already exists.",
          ],
        },
      };
    }

    throw error;
  }
}

export async function updateScheduleAction(
  _previousState:
    ScheduleSetupActionState,

  formData: FormData,
): Promise<ScheduleSetupActionState> {
  const session =
    await requireSettingsManager();

  if (!session) {
    return {
      ok: false,

      message:
        "You do not have permission to manage schedules.",
    };
  }

  const parsed =
    updateScheduleValidationSchema.safeParse(
      formDataToObject(
        formData,
      ),
    );

  if (!parsed.success) {
    return {
      ok: false,

      message:
        "Please review the highlighted fields.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const data =
    parsed.data;

  const existingSchedule =
    await prisma.shiftSchedule.findUnique({
      where: {
        scheduleId:
          data.scheduleId,
      },

      select:
        scheduleInspectionSelect,
    });

  if (!existingSchedule) {
    return {
      ok: false,

      message:
        "Schedule was not found.",
    };
  }

  const currentEmployeeCount =
    existingSchedule._count
      .currentEmployees;

  const assignmentHistoryCount =
    existingSchedule._count
      .employeeAssignments;

  const attendanceCount =
    existingSchedule._count
      .attendanceRecords;

  const activeAssignmentCount =
    existingSchedule
      .employeeAssignments
      .length;

  const coreEditingLocked =
    currentEmployeeCount >
      0 ||
    assignmentHistoryCount >
      0 ||
    attendanceCount >
      0;

  const coreRulesChanged =
    existingSchedule.shiftId !==
      data.shiftId ||
    existingSchedule.daysOfWeek !==
      data.daysOfWeek ||
    !sameDate(
      existingSchedule.effectiveFrom,
      data.effectiveFrom,
    ) ||
    !sameDate(
      existingSchedule.effectiveTo,
      data.effectiveTo,
    );

  if (
    coreEditingLocked &&
    coreRulesChanged
  ) {
    const ruleMessage =
      "This schedule already affects employees, assignment history, or attendance records. Create a new schedule for future rule changes.";

    return {
      ok: false,
      message:
        ruleMessage,

      fieldErrors: {
        shiftId: [
          ruleMessage,
        ],

        daysOfWeek: [
          ruleMessage,
        ],

        effectiveFrom: [
          ruleMessage,
        ],

        effectiveTo: [
          ruleMessage,
        ],
      },
    };
  }

  if (
    existingSchedule.status ===
      "ACTIVE" &&
    data.status !==
      "ACTIVE" &&
    (
      currentEmployeeCount >
        0 ||
      activeAssignmentCount >
        0
    )
  ) {
    return {
      ok: false,

      message:
        "This schedule cannot be deactivated or archived while employees are assigned to it.",

      fieldErrors: {
        status: [
          "Move the currently assigned employees to another schedule first.",
        ],
      },
    };
  }

  const targetShift =
    await prisma.shift.findUnique({
      where: {
        shiftId:
          data.shiftId,
      },

      select: {
        status: true,
      },
    });

  if (!targetShift) {
    return {
      ok: false,

      message:
        "Selected shift does not exist.",

      fieldErrors: {
        shiftId: [
          "Selected shift does not exist.",
        ],
      },
    };
  }

  const requiresActiveShift =
    data.status ===
      "ACTIVE" ||
    data.shiftId !==
      existingSchedule.shiftId;

  if (
    requiresActiveShift &&
    targetShift.status !==
      "ACTIVE"
  ) {
    return {
      ok: false,

      message:
        "An active schedule must use an active shift.",

      fieldErrors: {
        shiftId: [
          "Select an active shift.",
        ],
      },
    };
  }

  const duplicate =
    await prisma.shiftSchedule.findFirst({
      where: {
        scheduleId: {
          not:
            data.scheduleId,
        },

        OR: [
          {
            scheduleCode:
              data.scheduleCode,
          },
          {
            name:
              data.name,
          },
        ],
      },

      select: {
        scheduleCode: true,
        name: true,
      },
    });

  if (duplicate) {
    return {
      ok: false,

      message:
        "Schedule code or name already exists.",

      fieldErrors: {
        scheduleCode:
          duplicate.scheduleCode ===
          data.scheduleCode
            ? [
                "Schedule code already exists.",
              ]
            : undefined,

        name:
          duplicate.name ===
          data.name
            ? [
                "Schedule name already exists.",
              ]
            : undefined,
      },
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const updatedSchedule =
          await tx.shiftSchedule.update({
            where: {
              scheduleId:
                data.scheduleId,
            },

            data: {
              scheduleCode:
                data.scheduleCode,

              name:
                data.name,

              shiftId:
                data.shiftId,

              daysOfWeek:
                data.daysOfWeek,

              effectiveFrom:
                data.effectiveFrom,

              effectiveTo:
                data.effectiveTo,

              status:
                data.status,
            },

            select:
              scheduleAuditSelect,
          });

        await tx.activityLog.create({
          data: {
            actorUserId:
              session.userId,

            action:
              "SCHEDULE_UPDATED",

            entityType:
              "shift_schedule",

            entityId:
              String(
                updatedSchedule.scheduleId,
              ),

            oldValue:
              buildScheduleAuditValue(
                existingSchedule,
              ),

            newValue: {
              ...buildScheduleAuditValue(
                updatedSchedule,
              ),

              dependencyProtection: {
                currentEmployeeCount,
                assignmentHistoryCount,
                activeAssignmentCount,
                attendanceCount,
                coreRulesLocked:
                  coreEditingLocked,
              },
            },
          },
        });
      },
    );

    revalidateScheduleSetupPages();

    return {
      ok: true,

      message:
        "Schedule updated successfully.",
    };
  } catch (error) {
    if (
      isUniqueConstraintError(
        error,
      )
    ) {
      return {
        ok: false,

        message:
          "Schedule code already exists.",

        fieldErrors: {
          scheduleCode: [
            "Schedule code already exists.",
          ],
        },
      };
    }

    throw error;
  }
}