"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import {
  buildScheduleAssignmentWhere,
  hasSpecificScheduleAssignmentFilters,
  parseScheduleAssignmentFilters,
} from "./schedule-assignment-queries";
import type { ScheduleAssignmentActionState } from "../types/schedule-assignment-types";

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
): Record<string, string | string[] | undefined> {
  const output: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      output[key] = value;
    }
  }

  return output;
}

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

function parseDateInput(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function buildEmployeeAuditValue(
  employee: ScheduleAssignmentEmployee,
): Prisma.InputJsonObject {
  return {
    empId: employee.empId,
    empNumber: employee.empNumber,
    scheduleId: employee.scheduleId,
    status: employee.status,
    branchId: employee.branchId,
    departmentId: employee.departmentId,
    designationId: employee.designationId,
    empTypeId: employee.empTypeId,
  };
}

function buildUpdatedEmployeeAuditValue(input: {
  employee: ScheduleAssignmentEmployee;
  nextScheduleId: number;
  validFrom: Date;
  remarks: string;
}): Prisma.InputJsonObject {
  return {
    ...buildEmployeeAuditValue(input.employee),
    scheduleId: input.nextScheduleId,
    validFrom: input.validFrom.toISOString(),
    remarks: input.remarks || null,
  };
}

function revalidateScheduleAssignmentPages() {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/actions");
  revalidatePath("/dashboard/attendance/status-recalculation");
  revalidatePath("/dashboard/attendance/schedule-assignment");
  revalidatePath("/dashboard/employees");
}

export async function bulkAssignEmployeeScheduleAction(
  _previousState: ScheduleAssignmentActionState,
  formData: FormData,
): Promise<ScheduleAssignmentActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to assign employee schedules.",
    };
  }

  const filters = parseScheduleAssignmentFilters(formDataToRecord(formData));
  const targetScheduleId = parsePositiveId(formData.get("targetScheduleId"));
  const validFrom = parseDateInput(formData.get("validFrom"));
  const remarks =
    typeof formData.get("remarks") === "string"
      ? String(formData.get("remarks")).trim()
      : "";
  const limit = parseLimit(formData.get("limit"));
  const confirmAll = formData.get("confirmAll") === "on";

  if (!targetScheduleId) {
    return {
      ok: false,
      message: "Please select a target schedule.",
      fieldErrors: {
        targetScheduleId: ["Target schedule is required."],
      },
    };
  }

  if (!validFrom) {
    return {
      ok: false,
      message: "Please select a valid effective date.",
      fieldErrors: {
        validFrom: ["Effective date is required."],
      },
    };
  }

  if (!hasSpecificScheduleAssignmentFilters(filters) && !confirmAll) {
    return {
      ok: false,
      message:
        "Please choose at least one filter, or tick the confirmation box to apply this schedule to all matching employees.",
      fieldErrors: {
        confirmAll: ["Confirmation is required when no filters are selected."],
      },
    };
  }

  const targetSchedule = await prisma.shiftSchedule.findUnique({
    where: {
      scheduleId: targetScheduleId,
    },
    select: {
      scheduleId: true,
      scheduleCode: true,
      name: true,
    },
  });

  if (!targetSchedule) {
    return {
      ok: false,
      message: "Target schedule was not found.",
      fieldErrors: {
        targetScheduleId: ["Target schedule was not found."],
      },
    };
  }

  const where = buildScheduleAssignmentWhere(filters);

  const targetWhere: Prisma.EmployeeWhereInput = {
    AND: [
      where,
      {
        OR: [
          {
            scheduleId: {
              not: targetScheduleId,
            },
          },
          {
            scheduleId: null,
          },
        ],
      },
    ],
  };

  const result = await prisma.$transaction(async (tx) => {
    const employees = await tx.employee.findMany({
      where: targetWhere,
      select: {
        empId: true,
        empNumber: true,
        scheduleId: true,
        status: true,
        branchId: true,
        departmentId: true,
        designationId: true,
        empTypeId: true,
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
      await tx.employeeScheduleAssignment.updateMany({
        where: {
          empId: employee.empId,
          isActive: true,
        },
        data: {
          isActive: false,
          validTo: validFrom,
        },
      });

      await tx.employee.update({
        where: {
          empId: employee.empId,
        },
        data: {
          scheduleId: targetScheduleId,
        },
      });

      await tx.employeeScheduleAssignment.create({
        data: {
          empId: employee.empId,
          scheduleId: targetScheduleId,
          validFrom,
          validTo: null,
          isActive: true,
          assignedById: session.userId,
          remarks:
            remarks ||
            `Bulk assigned to ${targetSchedule.scheduleCode} · ${targetSchedule.name}`,
        },
      });

      await tx.activityLog.create({
        data: {
          actorUserId: session.userId,
          action: "EMPLOYEE_SCHEDULE_BULK_ASSIGNED",
          entityType: "employee",
          entityId: String(employee.empId),
          oldValue: buildEmployeeAuditValue(employee),
          newValue: buildUpdatedEmployeeAuditValue({
            employee,
            nextScheduleId: targetScheduleId,
            validFrom,
            remarks,
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

  revalidateScheduleAssignmentPages();

  return {
    ok: true,
    matchedCount: result.matchedCount,
    updatedCount: result.updatedCount,
    skippedCount: result.skippedCount,
    message:
      result.updatedCount > 0
        ? `${result.updatedCount} employee(s) assigned to ${targetSchedule.scheduleCode} · ${targetSchedule.name}.`
        : "No employee needed schedule changes. Matching employees may already have the selected schedule.",
  };
}