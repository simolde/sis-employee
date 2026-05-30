"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageSettings } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createScheduleValidationSchema,
  createShiftValidationSchema,
  updateScheduleValidationSchema,
  updateShiftValidationSchema,
} from "../validators/schedule-setup-validation";
import type { ScheduleSetupActionState } from "../types/schedule-setup-types";

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

async function requireSettingsManager() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageSettings(session.role)) {
    return null;
  }

  return session;
}

function buildShiftAuditValue(input: {
  shiftId: number;
  shiftCode: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  isOvernight: boolean;
  status: string;
}): Prisma.InputJsonObject {
  return {
    shiftId: input.shiftId,
    shiftCode: input.shiftCode,
    name: input.name,
    startTime: input.startTime,
    endTime: input.endTime,
    graceMinutes: input.graceMinutes,
    isOvernight: input.isOvernight,
    status: input.status,
  };
}

function buildScheduleAuditValue(input: {
  scheduleId: number;
  scheduleCode: string;
  name: string;
  shiftId: number;
  daysOfWeek: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  status: string;
}): Prisma.InputJsonObject {
  return {
    scheduleId: input.scheduleId,
    scheduleCode: input.scheduleCode,
    name: input.name,
    shiftId: input.shiftId,
    daysOfWeek: input.daysOfWeek,
    effectiveFrom: input.effectiveFrom.toISOString(),
    effectiveTo: input.effectiveTo?.toISOString() ?? null,
    status: input.status,
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

export async function createShiftAction(
  _previousState: ScheduleSetupActionState,
  formData: FormData,
): Promise<ScheduleSetupActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage shifts.",
    };
  }

  const parsed = createShiftValidationSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const duplicate = await prisma.shift.findFirst({
    where: {
      OR: [
        {
          shiftCode: data.shiftCode,
        },
        {
          name: data.name,
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
      message: "Shift code or name already exists.",
      fieldErrors: {
        shiftCode:
          duplicate.shiftCode === data.shiftCode
            ? ["Shift code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["Shift name already exists."]
            : undefined,
      },
    };
  }

  const shift = await prisma.$transaction(async (tx) => {
    const createdShift = await tx.shift.create({
      data: {
        shiftCode: data.shiftCode,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        graceMinutes: data.graceMinutes,
        isOvernight: data.isOvernight,
        status: "ACTIVE",
      },
      select: shiftAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "SHIFT_CREATED",
        entityType: "shift",
        entityId: String(createdShift.shiftId),
        newValue: buildShiftAuditValue(createdShift),
      },
    });

    return createdShift;
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/shifts");
  revalidatePath("/dashboard/settings/schedules");

  return {
    ok: true,
    message: `${shift.name} created successfully.`,
  };
}

export async function updateShiftAction(
  _previousState: ScheduleSetupActionState,
  formData: FormData,
): Promise<ScheduleSetupActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage shifts.",
    };
  }

  const parsed = updateShiftValidationSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existingShift = await prisma.shift.findUnique({
    where: {
      shiftId: data.shiftId,
    },
    select: shiftAuditSelect,
  });

  if (!existingShift) {
    return {
      ok: false,
      message: "Shift was not found.",
    };
  }

  const duplicate = await prisma.shift.findFirst({
    where: {
      shiftId: {
        not: data.shiftId,
      },
      OR: [
        {
          shiftCode: data.shiftCode,
        },
        {
          name: data.name,
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
      message: "Shift code or name already exists.",
      fieldErrors: {
        shiftCode:
          duplicate.shiftCode === data.shiftCode
            ? ["Shift code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["Shift name already exists."]
            : undefined,
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    const updatedShift = await tx.shift.update({
      where: {
        shiftId: data.shiftId,
      },
      data: {
        shiftCode: data.shiftCode,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        graceMinutes: data.graceMinutes,
        isOvernight: data.isOvernight,
        status: data.status,
      },
      select: shiftAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "SHIFT_UPDATED",
        entityType: "shift",
        entityId: String(updatedShift.shiftId),
        oldValue: buildShiftAuditValue(existingShift),
        newValue: buildShiftAuditValue(updatedShift),
      },
    });
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/shifts");
  revalidatePath("/dashboard/settings/schedules");

  return {
    ok: true,
    message: "Shift updated successfully.",
  };
}

export async function createScheduleAction(
  _previousState: ScheduleSetupActionState,
  formData: FormData,
): Promise<ScheduleSetupActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage schedules.",
    };
  }

  const parsed = createScheduleValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const activeShift = await prisma.shift.findFirst({
    where: {
      shiftId: data.shiftId,
      status: "ACTIVE",
    },
    select: {
      shiftId: true,
    },
  });

  if (!activeShift) {
    return {
      ok: false,
      message: "Selected shift is not active or does not exist.",
      fieldErrors: {
        shiftId: ["Selected shift is not active or does not exist."],
      },
    };
  }

  const duplicate = await prisma.shiftSchedule.findFirst({
    where: {
      OR: [
        {
          scheduleCode: data.scheduleCode,
        },
        {
          name: data.name,
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
      message: "Schedule code or name already exists.",
      fieldErrors: {
        scheduleCode:
          duplicate.scheduleCode === data.scheduleCode
            ? ["Schedule code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["Schedule name already exists."]
            : undefined,
      },
    };
  }

  const schedule = await prisma.$transaction(async (tx) => {
    const createdSchedule = await tx.shiftSchedule.create({
      data: {
        scheduleCode: data.scheduleCode,
        name: data.name,
        shiftId: data.shiftId,
        daysOfWeek: data.daysOfWeek,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        status: "ACTIVE",
      },
      select: scheduleAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "SCHEDULE_CREATED",
        entityType: "shift_schedule",
        entityId: String(createdSchedule.scheduleId),
        newValue: buildScheduleAuditValue(createdSchedule),
      },
    });

    return createdSchedule;
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/schedules");

  return {
    ok: true,
    message: `${schedule.name} created successfully.`,
  };
}

export async function updateScheduleAction(
  _previousState: ScheduleSetupActionState,
  formData: FormData,
): Promise<ScheduleSetupActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage schedules.",
    };
  }

  const parsed = updateScheduleValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existingSchedule = await prisma.shiftSchedule.findUnique({
    where: {
      scheduleId: data.scheduleId,
    },
    select: scheduleAuditSelect,
  });

  if (!existingSchedule) {
    return {
      ok: false,
      message: "Schedule was not found.",
    };
  }

  const activeShift = await prisma.shift.findFirst({
    where: {
      shiftId: data.shiftId,
      status: "ACTIVE",
    },
    select: {
      shiftId: true,
    },
  });

  if (!activeShift) {
    return {
      ok: false,
      message: "Selected shift is not active or does not exist.",
      fieldErrors: {
        shiftId: ["Selected shift is not active or does not exist."],
      },
    };
  }

  const duplicate = await prisma.shiftSchedule.findFirst({
    where: {
      scheduleId: {
        not: data.scheduleId,
      },
      OR: [
        {
          scheduleCode: data.scheduleCode,
        },
        {
          name: data.name,
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
      message: "Schedule code or name already exists.",
      fieldErrors: {
        scheduleCode:
          duplicate.scheduleCode === data.scheduleCode
            ? ["Schedule code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["Schedule name already exists."]
            : undefined,
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    const updatedSchedule = await tx.shiftSchedule.update({
      where: {
        scheduleId: data.scheduleId,
      },
      data: {
        scheduleCode: data.scheduleCode,
        name: data.name,
        shiftId: data.shiftId,
        daysOfWeek: data.daysOfWeek,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        status: data.status,
      },
      select: scheduleAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "SCHEDULE_UPDATED",
        entityType: "shift_schedule",
        entityId: String(updatedSchedule.scheduleId),
        oldValue: buildScheduleAuditValue(existingSchedule),
        newValue: buildScheduleAuditValue(updatedSchedule),
      },
    });
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/schedules");

  return {
    ok: true,
    message: "Schedule updated successfully.",
  };
}