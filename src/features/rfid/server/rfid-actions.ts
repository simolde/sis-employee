"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageRfid } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import { assignRfidValidationSchema } from "../validators/rfid-validation";

export type RfidActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialRfidActionState: RfidActionState = {
  ok: false,
  message: "",
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

function buildRfidAuditValue(input: {
  rfidId: number;
  empId: number;
  rfidUid: string;
  status: string;
  assignedAt: Date;
  disabledAt: Date | null;
  remarks: string | null;
}): Prisma.InputJsonObject {
  return {
    rfidId: input.rfidId,
    empId: input.empId,
    rfidUid: input.rfidUid,
    status: input.status,
    assignedAt: input.assignedAt.toISOString(),
    disabledAt: input.disabledAt?.toISOString() ?? null,
    remarks: input.remarks,
  };
}

async function requireRfidManagerSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageRfid(session.role)) {
    return {
      session,
      error: {
        ok: false,
        message: "You do not have permission to manage RFID cards.",
      } satisfies RfidActionState,
    };
  }

  return {
    session,
    error: null,
  };
}

export async function assignRfidCardAction(
  _previousState: RfidActionState,
  formData: FormData,
): Promise<RfidActionState> {
  const auth = await requireRfidManagerSession();

  if (auth.error) {
    return auth.error;
  }

  const parsed = assignRfidValidationSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: {
      empId: data.empId,
    },
    select: {
      empId: true,
      empNumber: true,
      status: true,
    },
  });

  if (!employee || employee.status !== "ACTIVE") {
    return {
      ok: false,
      message: "Selected employee is not active or does not exist.",
      fieldErrors: {
        empId: ["Selected employee is not active or does not exist."],
      },
    };
  }

  const activeSameUid = await prisma.rfidCard.findFirst({
    where: {
      rfidUid: data.rfidUid,
      status: "ACTIVE",
    },
    select: {
      rfidId: true,
      empId: true,
    },
  });

  if (activeSameUid && activeSameUid.empId !== data.empId) {
    return {
      ok: false,
      message: "This RFID UID is already actively assigned to another employee.",
      fieldErrors: {
        rfidUid: ["This RFID UID is already active for another employee."],
      },
    };
  }

  if (activeSameUid && activeSameUid.empId === data.empId) {
    return {
      ok: false,
      message: "This RFID UID is already active for the selected employee.",
      fieldErrors: {
        rfidUid: ["This RFID UID is already active for this employee."],
      },
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const oldActiveCards = await tx.rfidCard.findMany({
      where: {
        empId: data.empId,
        status: "ACTIVE",
      },
      select: {
        rfidId: true,
        empId: true,
        rfidUid: true,
        status: true,
        assignedAt: true,
        disabledAt: true,
        remarks: true,
      },
    });

    const replacedAt = new Date();

    if (oldActiveCards.length > 0) {
      await tx.rfidCard.updateMany({
        where: {
          empId: data.empId,
          status: "ACTIVE",
        },
        data: {
          status: "REPLACED",
          disabledAt: replacedAt,
          remarks: "Replaced by a new RFID card.",
        },
      });
    }

    const newCard = await tx.rfidCard.create({
      data: {
        empId: data.empId,
        rfidUid: data.rfidUid,
        status: "ACTIVE",
        assignedAt: new Date(),
        remarks: data.remarks,
      },
      select: {
        rfidId: true,
        empId: true,
        rfidUid: true,
        status: true,
        assignedAt: true,
        disabledAt: true,
        remarks: true,
      },
    });

    for (const oldCard of oldActiveCards) {
      await tx.activityLog.create({
        data: {
          actorUserId: auth.session.userId,
          action: "RFID_CARD_REPLACED",
          entityType: "rfid_card",
          entityId: String(oldCard.rfidId),
          oldValue: buildRfidAuditValue(oldCard),
          newValue: {
            ...buildRfidAuditValue(oldCard),
            status: "REPLACED",
            disabledAt: replacedAt.toISOString(),
            remarks: "Replaced by a new RFID card.",
          },
        },
      });
    }

    await tx.activityLog.create({
      data: {
        actorUserId: auth.session.userId,
        action: "RFID_CARD_ASSIGNED",
        entityType: "rfid_card",
        entityId: String(newCard.rfidId),
        newValue: buildRfidAuditValue(newCard),
      },
    });

    return newCard;
  });

  revalidatePath("/dashboard/rfid");
  revalidatePath(`/dashboard/employees/${data.empId}`);

  return {
    ok: true,
    message: `RFID ${result.rfidUid} assigned successfully.`,
  };
}

export async function disableRfidCardAction(
  rfidId: string,
  formData: FormData,
): Promise<void> {
  void formData;
  const auth = await requireRfidManagerSession();

  if (auth.error) {
    return;
  }

  const parsedRfidId = parsePositiveId(rfidId);

  if (!parsedRfidId) {
    return;
  }

  const existingCard = await prisma.rfidCard.findUnique({
    where: {
      rfidId: parsedRfidId,
    },
    select: {
      rfidId: true,
      empId: true,
      rfidUid: true,
      status: true,
      assignedAt: true,
      disabledAt: true,
      remarks: true,
    },
  });

  if (!existingCard || existingCard.status !== "ACTIVE") {
    return;
  }

  const updatedCard = await prisma.rfidCard.update({
    where: {
      rfidId: parsedRfidId,
    },
    data: {
      status: "DISABLED",
      disabledAt: new Date(),
      remarks: existingCard.remarks ?? "Disabled manually.",
    },
    select: {
      rfidId: true,
      empId: true,
      rfidUid: true,
      status: true,
      assignedAt: true,
      disabledAt: true,
      remarks: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorUserId: auth.session.userId,
      action: "RFID_CARD_DISABLED",
      entityType: "rfid_card",
      entityId: String(updatedCard.rfidId),
      oldValue: buildRfidAuditValue(existingCard),
      newValue: buildRfidAuditValue(updatedCard),
    },
  });

  revalidatePath("/dashboard/rfid");
  revalidatePath(`/dashboard/employees/${updatedCard.empId}`);
}