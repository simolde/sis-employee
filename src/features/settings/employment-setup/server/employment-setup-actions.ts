"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageSettings } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createDesignationValidationSchema,
  createEmployeeTypeValidationSchema,
  updateDesignationValidationSchema,
  updateEmployeeTypeValidationSchema,
} from "../validators/employment-setup-validation";
import type { EmploymentSetupActionState } from "../types/employment-setup-types";

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

function buildSetupAuditValue(input: {
  id: number;
  code: string;
  name: string;
  status: string;
}): Prisma.InputJsonObject {
  return {
    id: input.id,
    code: input.code,
    name: input.name,
    status: input.status,
  };
}

export async function createDesignationAction(
  _previousState: EmploymentSetupActionState,
  formData: FormData,
): Promise<EmploymentSetupActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage designations.",
    };
  }

  const parsed = createDesignationValidationSchema.safeParse(
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

  const duplicate = await prisma.designation.findFirst({
    where: {
      OR: [
        {
          designationCode: data.designationCode,
        },
        {
          name: data.name,
        },
      ],
    },
    select: {
      designationCode: true,
      name: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "Designation code or name already exists.",
      fieldErrors: {
        designationCode:
          duplicate.designationCode === data.designationCode
            ? ["Designation code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["Designation name already exists."]
            : undefined,
      },
    };
  }

  const designation = await prisma.$transaction(async (tx) => {
    const createdDesignation = await tx.designation.create({
      data: {
        designationCode: data.designationCode,
        name: data.name,
        status: "ACTIVE",
      },
      select: {
        designationId: true,
        designationCode: true,
        name: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "DESIGNATION_CREATED",
        entityType: "designation",
        entityId: String(createdDesignation.designationId),
        newValue: buildSetupAuditValue({
          id: createdDesignation.designationId,
          code: createdDesignation.designationCode,
          name: createdDesignation.name,
          status: createdDesignation.status,
        }),
      },
    });

    return createdDesignation;
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/designations");

  return {
    ok: true,
    message: `${designation.name} created successfully.`,
  };
}

export async function updateDesignationAction(
  _previousState: EmploymentSetupActionState,
  formData: FormData,
): Promise<EmploymentSetupActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage designations.",
    };
  }

  const parsed = updateDesignationValidationSchema.safeParse(
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

  const existingDesignation = await prisma.designation.findUnique({
    where: {
      designationId: data.designationId,
    },
    select: {
      designationId: true,
      designationCode: true,
      name: true,
      status: true,
    },
  });

  if (!existingDesignation) {
    return {
      ok: false,
      message: "Designation was not found.",
    };
  }

  const duplicate = await prisma.designation.findFirst({
    where: {
      designationId: {
        not: data.designationId,
      },
      OR: [
        {
          designationCode: data.designationCode,
        },
        {
          name: data.name,
        },
      ],
    },
    select: {
      designationCode: true,
      name: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "Designation code or name already exists.",
      fieldErrors: {
        designationCode:
          duplicate.designationCode === data.designationCode
            ? ["Designation code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["Designation name already exists."]
            : undefined,
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    const updatedDesignation = await tx.designation.update({
      where: {
        designationId: data.designationId,
      },
      data: {
        designationCode: data.designationCode,
        name: data.name,
        status: data.status,
      },
      select: {
        designationId: true,
        designationCode: true,
        name: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "DESIGNATION_UPDATED",
        entityType: "designation",
        entityId: String(updatedDesignation.designationId),
        oldValue: buildSetupAuditValue({
          id: existingDesignation.designationId,
          code: existingDesignation.designationCode,
          name: existingDesignation.name,
          status: existingDesignation.status,
        }),
        newValue: buildSetupAuditValue({
          id: updatedDesignation.designationId,
          code: updatedDesignation.designationCode,
          name: updatedDesignation.name,
          status: updatedDesignation.status,
        }),
      },
    });
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/designations");

  return {
    ok: true,
    message: "Designation updated successfully.",
  };
}

export async function createEmployeeTypeAction(
  _previousState: EmploymentSetupActionState,
  formData: FormData,
): Promise<EmploymentSetupActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage employee types.",
    };
  }

  const parsed = createEmployeeTypeValidationSchema.safeParse(
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

  const duplicate = await prisma.empType.findFirst({
    where: {
      OR: [
        {
          empTypeCode: data.empTypeCode,
        },
        {
          name: data.name,
        },
      ],
    },
    select: {
      empTypeCode: true,
      name: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "Employee type code or name already exists.",
      fieldErrors: {
        empTypeCode:
          duplicate.empTypeCode === data.empTypeCode
            ? ["Employee type code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["Employee type name already exists."]
            : undefined,
      },
    };
  }

  const employeeType = await prisma.$transaction(async (tx) => {
    const createdEmployeeType = await tx.empType.create({
      data: {
        empTypeCode: data.empTypeCode,
        name: data.name,
        status: "ACTIVE",
      },
      select: {
        empTypeId: true,
        empTypeCode: true,
        name: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "EMPLOYEE_TYPE_CREATED",
        entityType: "emp_type",
        entityId: String(createdEmployeeType.empTypeId),
        newValue: buildSetupAuditValue({
          id: createdEmployeeType.empTypeId,
          code: createdEmployeeType.empTypeCode,
          name: createdEmployeeType.name,
          status: createdEmployeeType.status,
        }),
      },
    });

    return createdEmployeeType;
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/employee-types");

  return {
    ok: true,
    message: `${employeeType.name} created successfully.`,
  };
}

export async function updateEmployeeTypeAction(
  _previousState: EmploymentSetupActionState,
  formData: FormData,
): Promise<EmploymentSetupActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage employee types.",
    };
  }

  const parsed = updateEmployeeTypeValidationSchema.safeParse(
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

  const existingEmployeeType = await prisma.empType.findUnique({
    where: {
      empTypeId: data.empTypeId,
    },
    select: {
      empTypeId: true,
      empTypeCode: true,
      name: true,
      status: true,
    },
  });

  if (!existingEmployeeType) {
    return {
      ok: false,
      message: "Employee type was not found.",
    };
  }

  const duplicate = await prisma.empType.findFirst({
    where: {
      empTypeId: {
        not: data.empTypeId,
      },
      OR: [
        {
          empTypeCode: data.empTypeCode,
        },
        {
          name: data.name,
        },
      ],
    },
    select: {
      empTypeCode: true,
      name: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "Employee type code or name already exists.",
      fieldErrors: {
        empTypeCode:
          duplicate.empTypeCode === data.empTypeCode
            ? ["Employee type code already exists."]
            : undefined,
        name:
          duplicate.name === data.name
            ? ["Employee type name already exists."]
            : undefined,
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    const updatedEmployeeType = await tx.empType.update({
      where: {
        empTypeId: data.empTypeId,
      },
      data: {
        empTypeCode: data.empTypeCode,
        name: data.name,
        status: data.status,
      },
      select: {
        empTypeId: true,
        empTypeCode: true,
        name: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "EMPLOYEE_TYPE_UPDATED",
        entityType: "emp_type",
        entityId: String(updatedEmployeeType.empTypeId),
        oldValue: buildSetupAuditValue({
          id: existingEmployeeType.empTypeId,
          code: existingEmployeeType.empTypeCode,
          name: existingEmployeeType.name,
          status: existingEmployeeType.status,
        }),
        newValue: buildSetupAuditValue({
          id: updatedEmployeeType.empTypeId,
          code: updatedEmployeeType.empTypeCode,
          name: updatedEmployeeType.name,
          status: updatedEmployeeType.status,
        }),
      },
    });
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/employee-types");

  return {
    ok: true,
    message: "Employee type updated successfully.",
  };
}