"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageLeaves } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createLeaveTypeValidationSchema,
  updateLeaveTypeValidationSchema,
} from "../validators/leave-type-validation";
import type { LeaveTypeActionState } from "../types/leave-type-types";

type LeaveTypeAuditValueInput = {
  leaveTypeId: number;
  name: string;
  code: string;
  isPaid: boolean;
  requiresAttachment: boolean;
  status: string;
};

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function buildLeaveTypeAuditValue(
  input: LeaveTypeAuditValueInput,
): Prisma.InputJsonObject {
  return {
    leaveTypeId: input.leaveTypeId,
    name: input.name,
    code: input.code,
    isPaid: input.isPaid,
    requiresAttachment: input.requiresAttachment,
    status: input.status,
  };
}

const leaveTypeAuditSelect = {
  leaveTypeId: true,
  name: true,
  code: true,
  isPaid: true,
  requiresAttachment: true,
  status: true,
} satisfies Prisma.LeaveTypeSelect;

async function requireLeaveManager() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageLeaves(session.role)) {
    return null;
  }

  return session;
}

export async function createLeaveTypeAction(
  _previousState: LeaveTypeActionState,
  formData: FormData,
): Promise<LeaveTypeActionState> {
  const session = await requireLeaveManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage leave types.",
    };
  }

  const parsed = createLeaveTypeValidationSchema.safeParse(
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

  const duplicate = await prisma.leaveType.findFirst({
    where: {
      OR: [
        {
          code: data.code,
        },
        {
          name: data.name,
        },
      ],
    },
    select: {
      leaveTypeId: true,
      code: true,
      name: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "A leave type with the same name or code already exists.",
      fieldErrors: {
        code:
          duplicate.code === data.code
            ? ["This leave type code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["This leave type name already exists."]
            : undefined,
      },
    };
  }

  const createdLeaveType = await prisma.$transaction(async (tx) => {
    const leaveType = await tx.leaveType.create({
      data: {
        name: data.name,
        code: data.code,
        isPaid: data.isPaid,
        requiresAttachment: data.requiresAttachment,
        status: "ACTIVE",
      },
      select: leaveTypeAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "LEAVE_TYPE_CREATED",
        entityType: "leave_type",
        entityId: String(leaveType.leaveTypeId),
        newValue: buildLeaveTypeAuditValue(leaveType),
      },
    });

    return leaveType;
  });

  revalidatePath("/dashboard/leaves");
  revalidatePath("/dashboard/leaves/types");

  return {
    ok: true,
    message: `${createdLeaveType.name} created successfully.`,
  };
}

export async function updateLeaveTypeAction(
  _previousState: LeaveTypeActionState,
  formData: FormData,
): Promise<LeaveTypeActionState> {
  const session = await requireLeaveManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage leave types.",
    };
  }

  const parsed = updateLeaveTypeValidationSchema.safeParse(
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

  const existingLeaveType = await prisma.leaveType.findUnique({
    where: {
      leaveTypeId: data.leaveTypeId,
    },
    select: leaveTypeAuditSelect,
  });

  if (!existingLeaveType) {
    return {
      ok: false,
      message: "Leave type was not found.",
    };
  }

  const duplicate = await prisma.leaveType.findFirst({
    where: {
      leaveTypeId: {
        not: data.leaveTypeId,
      },
      OR: [
        {
          code: data.code,
        },
        {
          name: data.name,
        },
      ],
    },
    select: {
      leaveTypeId: true,
      code: true,
      name: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "A leave type with the same name or code already exists.",
      fieldErrors: {
        code:
          duplicate.code === data.code
            ? ["This leave type code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["This leave type name already exists."]
            : undefined,
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    const updatedLeaveType = await tx.leaveType.update({
      where: {
        leaveTypeId: data.leaveTypeId,
      },
      data: {
        name: data.name,
        code: data.code,
        isPaid: data.isPaid,
        requiresAttachment: data.requiresAttachment,
        status: data.status,
      },
      select: leaveTypeAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "LEAVE_TYPE_UPDATED",
        entityType: "leave_type",
        entityId: String(updatedLeaveType.leaveTypeId),
        oldValue: buildLeaveTypeAuditValue(existingLeaveType),
        newValue: buildLeaveTypeAuditValue(updatedLeaveType),
      },
    });
  });

  revalidatePath("/dashboard/leaves");
  revalidatePath("/dashboard/leaves/types");

  return {
    ok: true,
    message: "Leave type updated successfully.",
  };
}

export async function activateLeaveTypeAction(
  leaveTypeId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const session = await requireLeaveManager();

  if (!session) {
    return;
  }

  const parsedLeaveTypeId = parsePositiveId(leaveTypeId);

  if (!parsedLeaveTypeId) {
    return;
  }

  const existingLeaveType = await prisma.leaveType.findUnique({
    where: {
      leaveTypeId: parsedLeaveTypeId,
    },
    select: leaveTypeAuditSelect,
  });

  if (!existingLeaveType) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const updatedLeaveType = await tx.leaveType.update({
      where: {
        leaveTypeId: parsedLeaveTypeId,
      },
      data: {
        status: "ACTIVE",
      },
      select: leaveTypeAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "LEAVE_TYPE_ACTIVATED",
        entityType: "leave_type",
        entityId: String(updatedLeaveType.leaveTypeId),
        oldValue: buildLeaveTypeAuditValue(existingLeaveType),
        newValue: buildLeaveTypeAuditValue(updatedLeaveType),
      },
    });
  });

  revalidatePath("/dashboard/leaves");
  revalidatePath("/dashboard/leaves/types");
}

export async function deactivateLeaveTypeAction(
  leaveTypeId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const session = await requireLeaveManager();

  if (!session) {
    return;
  }

  const parsedLeaveTypeId = parsePositiveId(leaveTypeId);

  if (!parsedLeaveTypeId) {
    return;
  }

  const existingLeaveType = await prisma.leaveType.findUnique({
    where: {
      leaveTypeId: parsedLeaveTypeId,
    },
    select: leaveTypeAuditSelect,
  });

  if (!existingLeaveType) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const updatedLeaveType = await tx.leaveType.update({
      where: {
        leaveTypeId: parsedLeaveTypeId,
      },
      data: {
        status: "INACTIVE",
      },
      select: leaveTypeAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "LEAVE_TYPE_DEACTIVATED",
        entityType: "leave_type",
        entityId: String(updatedLeaveType.leaveTypeId),
        oldValue: buildLeaveTypeAuditValue(existingLeaveType),
        newValue: buildLeaveTypeAuditValue(updatedLeaveType),
      },
    });
  });

  revalidatePath("/dashboard/leaves");
  revalidatePath("/dashboard/leaves/types");
}