"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import {
  buildOdlAccessBulkWhere,
  hasOdlAccessBulkSpecificFilters,
  parseOdlAccessBulkFilters,
} from "./odl-access-bulk-queries";
import type { OdlAccessBulkActionState } from "../types/odl-access-bulk-types";

type OdlAccessBulkEmployee = {
  empId: number;
  empNumber: string;
  isFlexible: boolean;
  status: string;
  branchId: number;
  departmentId: number | null;
  designationId: number | null;
  empTypeId: number | null;
  scheduleId: number | null;
};

function formDataToRecord(
  formData: FormData,
): Record<string, string | string[] | undefined> {
  const output: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      output[key] = value;
    }
  }

  return output;
}

function parseMode(value: FormDataEntryValue | null): "ENABLE" | "DISABLE" | null {
  if (value === "ENABLE" || value === "DISABLE") {
    return value;
  }

  return null;
}

function parseLimit(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") {
    return 500;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 500;
  }

  return Math.min(parsed, 500);
}

function buildEmployeeAuditValue(
  employee: OdlAccessBulkEmployee,
): Prisma.InputJsonObject {
  return {
    empId: employee.empId,
    empNumber: employee.empNumber,
    isFlexible: employee.isFlexible,
    status: employee.status,
    branchId: employee.branchId,
    departmentId: employee.departmentId,
    designationId: employee.designationId,
    empTypeId: employee.empTypeId,
    scheduleId: employee.scheduleId,
  };
}

function buildUpdatedEmployeeAuditValue(input: {
  employee: OdlAccessBulkEmployee;
  nextValue: boolean;
  bulkMode: "ENABLE" | "DISABLE";
}): Prisma.InputJsonObject {
  return {
    ...buildEmployeeAuditValue(input.employee),
    isFlexible: input.nextValue,
    bulkMode: input.bulkMode,
  };
}

function revalidateOdlAccessBulkPages() {
  revalidatePath("/dashboard/attendance/odl");
  revalidatePath("/dashboard/attendance/odl/access");
  revalidatePath("/dashboard/attendance/odl/access/bulk");
  revalidatePath("/dashboard/attendance/odl/eligibility");
  revalidatePath("/dashboard/attendance/odl/history");
  revalidatePath("/dashboard/employees");
}

export async function bulkUpdateOdlAccessAction(
  _previousState: OdlAccessBulkActionState,
  formData: FormData,
): Promise<OdlAccessBulkActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to bulk update ODL access.",
    };
  }

  const mode = parseMode(formData.get("mode"));
  const filters = parseOdlAccessBulkFilters(formDataToRecord(formData));
  const limit = parseLimit(formData.get("limit"));
  const confirmAll = formData.get("confirmAll") === "on";

  if (!mode) {
    return {
      ok: false,
      message: "Invalid bulk update mode.",
      fieldErrors: {
        mode: ["Invalid bulk update mode."],
      },
    };
  }

  if (!hasOdlAccessBulkSpecificFilters(filters) && !confirmAll) {
    return {
      ok: false,
      message:
        "Please choose at least one filter, or tick the confirmation box to apply this action to all employees.",
      fieldErrors: {
        confirmAll: ["Confirmation is required when no filters are selected."],
      },
    };
  }

  const nextValue = mode === "ENABLE";
  const where = buildOdlAccessBulkWhere(filters);
  const targetWhere: Prisma.EmployeeWhereInput = {
    AND: [
      where,
      {
        isFlexible: !nextValue,
      },
    ],
  };

  const result = await prisma.$transaction(async (tx) => {
    const employees = await tx.employee.findMany({
      where: targetWhere,
      select: {
        empId: true,
        empNumber: true,
        isFlexible: true,
        status: true,
        branchId: true,
        departmentId: true,
        designationId: true,
        empTypeId: true,
        scheduleId: true,
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
      take: limit,
    });

    let updatedCount = 0;

    for (const employee of employees) {
      await tx.employee.update({
        where: {
          empId: employee.empId,
        },
        data: {
          isFlexible: nextValue,
        },
      });

      await tx.activityLog.create({
        data: {
          actorUserId: session.userId,
          action:
            mode === "ENABLE"
              ? "ODL_ACCESS_BULK_ENABLED"
              : "ODL_ACCESS_BULK_DISABLED",
          entityType: "employee",
          entityId: String(employee.empId),
          oldValue: buildEmployeeAuditValue(employee),
          newValue: buildUpdatedEmployeeAuditValue({
            employee,
            nextValue,
            bulkMode: mode,
          }),
        },
      });

      updatedCount += 1;
    }

    return {
      matchedCount: employees.length,
      updatedCount,
      skippedCount: employees.length - updatedCount,
    };
  });

  revalidateOdlAccessBulkPages();

  return {
    ok: true,
    matchedCount: result.matchedCount,
    updatedCount: result.updatedCount,
    skippedCount: result.skippedCount,
    message:
      result.updatedCount > 0
        ? `${result.updatedCount} employee(s) ${
            mode === "ENABLE" ? "enabled" : "disabled"
          } for ODL/Flexible attendance.`
        : `No employee needed changes. The selected employees were already ${
            mode === "ENABLE" ? "enabled" : "disabled"
          }.`,
  };
}