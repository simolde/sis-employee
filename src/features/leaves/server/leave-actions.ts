"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageLeaves } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createLeaveRequestValidationSchema,
  rejectLeaveValidationSchema,
} from "../validators/leave-validation";
import type { LeaveActionState } from "../types/leave-action-state";

type LeaveAuditValueInput = {
  leaveId: number;
  empId: number;
  leaveTypeId: number;
  dateFrom: Date;
  dateTo: Date;
  totalDays: { toString(): string };
  reason: string;
  status: string;
  approvedById: number | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdById: number | null;
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

function calculateInclusiveDays(dateFrom: Date, dateTo: Date): number {
  const start = Date.UTC(
    dateFrom.getUTCFullYear(),
    dateFrom.getUTCMonth(),
    dateFrom.getUTCDate(),
  );
  const end = Date.UTC(
    dateTo.getUTCFullYear(),
    dateTo.getUTCMonth(),
    dateTo.getUTCDate(),
  );

  return Math.floor((end - start) / 86400000) + 1;
}

function toNumber(value: { toString(): string } | number): number {
  return Number(value.toString());
}

function buildLeaveAuditValue(input: LeaveAuditValueInput): Prisma.InputJsonObject {
  return {
    leaveId: input.leaveId,
    empId: input.empId,
    leaveTypeId: input.leaveTypeId,
    dateFrom: input.dateFrom.toISOString(),
    dateTo: input.dateTo.toISOString(),
    totalDays: input.totalDays.toString(),
    reason: input.reason,
    status: input.status,
    approvedById: input.approvedById,
    approvedAt: input.approvedAt?.toISOString() ?? null,
    rejectionReason: input.rejectionReason,
    createdById: input.createdById,
  };
}

async function getCurrentEmployeeId(userId: number): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      empId: true,
    },
  });

  return user?.empId ?? null;
}

const leaveAuditSelect = {
  leaveId: true,
  empId: true,
  leaveTypeId: true,
  dateFrom: true,
  dateTo: true,
  totalDays: true,
  reason: true,
  status: true,
  approvedById: true,
  approvedAt: true,
  rejectionReason: true,
  createdById: true,
} satisfies Prisma.LeaveSelect;

export async function createLeaveRequestAction(
  _previousState: LeaveActionState,
  formData: FormData,
): Promise<LeaveActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const empId = await getCurrentEmployeeId(session.userId);

  if (!empId) {
    return {
      ok: false,
      message: "No employee profile is connected to this login account.",
    };
  }

  const parsed = createLeaveRequestValidationSchema.safeParse(
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

  const leaveType = await prisma.leaveType.findUnique({
    where: {
      leaveTypeId: data.leaveTypeId,
    },
    select: {
      leaveTypeId: true,
      status: true,
    },
  });

  if (!leaveType || leaveType.status !== "ACTIVE") {
    return {
      ok: false,
      message: "Selected leave type is not active.",
      fieldErrors: {
        leaveTypeId: ["Selected leave type is not active."],
      },
    };
  }

  const totalDays = calculateInclusiveDays(data.dateFrom, data.dateTo);

  const createdLeave = await prisma.$transaction(async (tx) => {
    const leave = await tx.leave.create({
      data: {
        empId,
        leaveTypeId: data.leaveTypeId,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        totalDays,
        reason: data.reason,
        status: "PENDING",
        createdById: session.userId,
      },
      select: leaveAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "LEAVE_REQUEST_CREATED",
        entityType: "leave",
        entityId: String(leave.leaveId),
        newValue: buildLeaveAuditValue(leave),
      },
    });

    return leave;
  });

  revalidatePath("/dashboard/leaves");

  return {
    ok: true,
    message: `Leave request #${createdLeave.leaveId} submitted successfully.`,
  };
}

export async function cancelLeaveRequestAction(
  leaveId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const parsedLeaveId = parsePositiveId(leaveId);
  const empId = await getCurrentEmployeeId(session.userId);

  if (!parsedLeaveId || !empId) {
    return;
  }

  const existingLeave = await prisma.leave.findFirst({
    where: {
      leaveId: parsedLeaveId,
      empId,
      status: "PENDING",
    },
    select: leaveAuditSelect,
  });

  if (!existingLeave) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const updatedLeave = await tx.leave.update({
      where: {
        leaveId: existingLeave.leaveId,
      },
      data: {
        status: "CANCELLED",
      },
      select: leaveAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "LEAVE_REQUEST_CANCELLED",
        entityType: "leave",
        entityId: String(updatedLeave.leaveId),
        oldValue: buildLeaveAuditValue(existingLeave),
        newValue: buildLeaveAuditValue(updatedLeave),
      },
    });
  });

  revalidatePath("/dashboard/leaves");
  redirect("/dashboard/leaves?notice=leave-cancelled");
}

export async function approveLeaveRequestAction(
  leaveId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageLeaves(session.role)) {
    return;
  }

  const parsedLeaveId = parsePositiveId(leaveId);

  if (!parsedLeaveId) {
    return;
  }

  const existingLeave = await prisma.leave.findFirst({
    where: {
      leaveId: parsedLeaveId,
      status: "PENDING",
    },
    select: {
      ...leaveAuditSelect,
      leaveType: {
        select: {
          isPaid: true,
          name: true,
        },
      },
      employee: {
        select: {
          avLeave: true,
        },
      },
    },
  });

  if (!existingLeave) {
    return;
  }

  const leaveDays = toNumber(existingLeave.totalDays);
  const availableLeave = toNumber(existingLeave.employee.avLeave);

  if (existingLeave.leaveType.isPaid && availableLeave < leaveDays) {
    redirect("/dashboard/leaves?notice=insufficient-leave-balance");
  }

  await prisma.$transaction(async (tx) => {
    if (existingLeave.leaveType.isPaid) {
      await tx.employee.update({
        where: {
          empId: existingLeave.empId,
        },
        data: {
          avLeave: {
            decrement: leaveDays,
          },
        },
      });
    }

    const updatedLeave = await tx.leave.update({
      where: {
        leaveId: existingLeave.leaveId,
      },
      data: {
        status: "APPROVED",
        approvedById: session.userId,
        approvedAt: new Date(),
        rejectionReason: null,
      },
      select: leaveAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: existingLeave.leaveType.isPaid
          ? "LEAVE_REQUEST_APPROVED_BALANCE_DEDUCTED"
          : "LEAVE_REQUEST_APPROVED_UNPAID",
        entityType: "leave",
        entityId: String(updatedLeave.leaveId),
        oldValue: buildLeaveAuditValue(existingLeave),
        newValue: {
          ...buildLeaveAuditValue(updatedLeave),
          deductedLeaveDays: existingLeave.leaveType.isPaid ? leaveDays : 0,
          leaveTypeName: existingLeave.leaveType.name,
        },
      },
    });
  });

  revalidatePath("/dashboard/leaves");
  redirect("/dashboard/leaves?notice=leave-approved");
}

export async function rejectLeaveRequestAction(
  leaveId: string,
  formData: FormData,
): Promise<void> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageLeaves(session.role)) {
    return;
  }

  const parsedLeaveId = parsePositiveId(leaveId);
  const parsed = rejectLeaveValidationSchema.safeParse(formDataToObject(formData));

  if (!parsedLeaveId || !parsed.success) {
    return;
  }

  const existingLeave = await prisma.leave.findFirst({
    where: {
      leaveId: parsedLeaveId,
      status: "PENDING",
    },
    select: leaveAuditSelect,
  });

  if (!existingLeave) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const updatedLeave = await tx.leave.update({
      where: {
        leaveId: existingLeave.leaveId,
      },
      data: {
        status: "REJECTED",
        approvedById: session.userId,
        approvedAt: new Date(),
        rejectionReason: parsed.data.rejectionReason,
      },
      select: leaveAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "LEAVE_REQUEST_REJECTED",
        entityType: "leave",
        entityId: String(updatedLeave.leaveId),
        oldValue: buildLeaveAuditValue(existingLeave),
        newValue: buildLeaveAuditValue(updatedLeave),
      },
    });
  });

  revalidatePath("/dashboard/leaves");
  redirect("/dashboard/leaves?notice=leave-rejected");
}

export async function reverseApprovedLeaveRequestAction(
  leaveId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageLeaves(session.role)) {
    return;
  }

  const parsedLeaveId = parsePositiveId(leaveId);

  if (!parsedLeaveId) {
    return;
  }

  const existingLeave = await prisma.leave.findFirst({
    where: {
      leaveId: parsedLeaveId,
      status: "APPROVED",
    },
    select: {
      ...leaveAuditSelect,
      leaveType: {
        select: {
          isPaid: true,
          name: true,
        },
      },
    },
  });

  if (!existingLeave) {
    return;
  }

  const leaveDays = toNumber(existingLeave.totalDays);

  await prisma.$transaction(async (tx) => {
    if (existingLeave.leaveType.isPaid) {
      await tx.employee.update({
        where: {
          empId: existingLeave.empId,
        },
        data: {
          avLeave: {
            increment: leaveDays,
          },
        },
      });
    }

    const updatedLeave = await tx.leave.update({
      where: {
        leaveId: existingLeave.leaveId,
      },
      data: {
        status: "CANCELLED",
        approvedById: session.userId,
        approvedAt: new Date(),
        rejectionReason: "Approved leave reversed by HR/Admin.",
      },
      select: leaveAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: existingLeave.leaveType.isPaid
          ? "APPROVED_LEAVE_REVERSED_BALANCE_RESTORED"
          : "APPROVED_LEAVE_REVERSED_UNPAID",
        entityType: "leave",
        entityId: String(updatedLeave.leaveId),
        oldValue: buildLeaveAuditValue(existingLeave),
        newValue: {
          ...buildLeaveAuditValue(updatedLeave),
          restoredLeaveDays: existingLeave.leaveType.isPaid ? leaveDays : 0,
          leaveTypeName: existingLeave.leaveType.name,
        },
      },
    });
  });

  revalidatePath("/dashboard/leaves");
  redirect("/dashboard/leaves?notice=leave-reversed");
}