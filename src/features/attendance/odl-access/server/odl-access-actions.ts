"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import type { OdlAccessActionState } from "../types/odl-access-types";

type OdlAccessAuditEmployee = {
  empId: number;
  empNumber: string;
  isFlexible: boolean;
  status: string;
};

function parsePositiveId(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseBooleanValue(value: FormDataEntryValue | null): boolean | null {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

function buildOdlAccessAuditValue(
  employee: OdlAccessAuditEmployee,
): Prisma.InputJsonObject {
  return {
    empId: employee.empId,
    empNumber: employee.empNumber,
    isFlexible: employee.isFlexible,
    status: employee.status,
  };
}

function revalidateOdlAccessPages(empId: number) {
  revalidatePath("/dashboard/attendance/odl");
  revalidatePath("/dashboard/attendance/odl/access");
  revalidatePath("/dashboard/attendance/odl/eligibility");
  revalidatePath("/dashboard/attendance/odl/history");
  revalidatePath(`/dashboard/employees/${empId}`);
  revalidatePath(`/dashboard/employees/${empId}/edit`);
}

export async function updateOdlAccessAction(
  _previousState: OdlAccessActionState,
  formData: FormData,
): Promise<OdlAccessActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to update ODL access.",
    };
  }

  const empId = parsePositiveId(formData.get("empId"));
  const nextValue = parseBooleanValue(formData.get("nextValue"));

  if (!empId) {
    return {
      ok: false,
      message: "Invalid employee record.",
      fieldErrors: {
        empId: ["Invalid employee record."],
      },
    };
  }

  if (nextValue === null) {
    return {
      ok: false,
      message: "Invalid ODL access value.",
      fieldErrors: {
        nextValue: ["Invalid ODL access value."],
      },
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingEmployee = await tx.employee.findUnique({
      where: {
        empId,
      },
      select: {
        empId: true,
        empNumber: true,
        isFlexible: true,
        status: true,
      },
    });

    if (!existingEmployee) {
      return null;
    }

    const updatedEmployee = await tx.employee.update({
      where: {
        empId,
      },
      data: {
        isFlexible: nextValue,
      },
      select: {
        empId: true,
        empNumber: true,
        isFlexible: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: nextValue ? "ODL_ACCESS_ENABLED" : "ODL_ACCESS_DISABLED",
        entityType: "employee",
        entityId: String(updatedEmployee.empId),
        oldValue: buildOdlAccessAuditValue(existingEmployee),
        newValue: buildOdlAccessAuditValue(updatedEmployee),
      },
    });

    return updatedEmployee;
  });

  if (!result) {
    return {
      ok: false,
      message: "Employee record was not found.",
    };
  }

  revalidateOdlAccessPages(result.empId);

  return {
    ok: true,
    message: result.isFlexible
      ? `${result.empNumber} is now enabled for ODL/Flexible attendance.`
      : `${result.empNumber} is now disabled for ODL/Flexible attendance.`,
  };
}