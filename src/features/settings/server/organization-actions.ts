"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageSettings } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createBranchValidationSchema,
  createDepartmentValidationSchema,
  updateBranchValidationSchema,
  updateDepartmentValidationSchema,
} from "../validators/organization-validation";
import type { OrganizationActionState } from "../types/organization-types";

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

function buildOrganizationAuditValue(input: {
  id: number;
  name: string;
  status: string;
}): Prisma.InputJsonObject {
  return {
    id: input.id,
    name: input.name,
    status: input.status,
  };
}

export async function createBranchAction(
  _previousState: OrganizationActionState,
  formData: FormData,
): Promise<OrganizationActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage branches.",
    };
  }

  const parsed = createBranchValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const duplicate = await prisma.branch.findFirst({
    where: {
      name: parsed.data.name,
    },
    select: {
      branchId: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "Branch name already exists.",
      fieldErrors: {
        name: ["Branch name already exists."],
      },
    };
  }

  const branch = await prisma.$transaction(async (tx) => {
    const createdBranch = await tx.branch.create({
      data: {
        name: parsed.data.name,
        status: "ACTIVE",
      },
      select: {
        branchId: true,
        name: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "BRANCH_CREATED",
        entityType: "branch",
        entityId: String(createdBranch.branchId),
        newValue: buildOrganizationAuditValue({
          id: createdBranch.branchId,
          name: createdBranch.name,
          status: createdBranch.status,
        }),
      },
    });

    return createdBranch;
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/branches");

  return {
    ok: true,
    message: `${branch.name} created successfully.`,
  };
}

export async function updateBranchAction(
  _previousState: OrganizationActionState,
  formData: FormData,
): Promise<OrganizationActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage branches.",
    };
  }

  const parsed = updateBranchValidationSchema.safeParse(
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

  const existingBranch = await prisma.branch.findUnique({
    where: {
      branchId: data.branchId,
    },
    select: {
      branchId: true,
      name: true,
      status: true,
    },
  });

  if (!existingBranch) {
    return {
      ok: false,
      message: "Branch was not found.",
    };
  }

  const duplicate = await prisma.branch.findFirst({
    where: {
      branchId: {
        not: data.branchId,
      },
      name: data.name,
    },
    select: {
      branchId: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "Branch name already exists.",
      fieldErrors: {
        name: ["Branch name already exists."],
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    const updatedBranch = await tx.branch.update({
      where: {
        branchId: data.branchId,
      },
      data: {
        name: data.name,
        status: data.status,
      },
      select: {
        branchId: true,
        name: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "BRANCH_UPDATED",
        entityType: "branch",
        entityId: String(updatedBranch.branchId),
        oldValue: buildOrganizationAuditValue({
          id: existingBranch.branchId,
          name: existingBranch.name,
          status: existingBranch.status,
        }),
        newValue: buildOrganizationAuditValue({
          id: updatedBranch.branchId,
          name: updatedBranch.name,
          status: updatedBranch.status,
        }),
      },
    });
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/branches");

  return {
    ok: true,
    message: "Branch updated successfully.",
  };
}

export async function createDepartmentAction(
  _previousState: OrganizationActionState,
  formData: FormData,
): Promise<OrganizationActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage departments.",
    };
  }

  const parsed = createDepartmentValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const duplicate = await prisma.department.findFirst({
    where: {
      name: parsed.data.name,
    },
    select: {
      departmentId: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "Department name already exists.",
      fieldErrors: {
        name: ["Department name already exists."],
      },
    };
  }

  const department = await prisma.$transaction(async (tx) => {
    const createdDepartment = await tx.department.create({
      data: {
        name: parsed.data.name,
        status: "ACTIVE",
      },
      select: {
        departmentId: true,
        name: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "DEPARTMENT_CREATED",
        entityType: "department",
        entityId: String(createdDepartment.departmentId),
        newValue: buildOrganizationAuditValue({
          id: createdDepartment.departmentId,
          name: createdDepartment.name,
          status: createdDepartment.status,
        }),
      },
    });

    return createdDepartment;
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/departments");

  return {
    ok: true,
    message: `${department.name} created successfully.`,
  };
}

export async function updateDepartmentAction(
  _previousState: OrganizationActionState,
  formData: FormData,
): Promise<OrganizationActionState> {
  const session = await requireSettingsManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage departments.",
    };
  }

  const parsed = updateDepartmentValidationSchema.safeParse(
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

  const existingDepartment = await prisma.department.findUnique({
    where: {
      departmentId: data.departmentId,
    },
    select: {
      departmentId: true,
      name: true,
      status: true,
    },
  });

  if (!existingDepartment) {
    return {
      ok: false,
      message: "Department was not found.",
    };
  }

  const duplicate = await prisma.department.findFirst({
    where: {
      departmentId: {
        not: data.departmentId,
      },
      name: data.name,
    },
    select: {
      departmentId: true,
    },
  });

  if (duplicate) {
    return {
      ok: false,
      message: "Department name already exists.",
      fieldErrors: {
        name: ["Department name already exists."],
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    const updatedDepartment = await tx.department.update({
      where: {
        departmentId: data.departmentId,
      },
      data: {
        name: data.name,
        status: data.status,
      },
      select: {
        departmentId: true,
        name: true,
        status: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "DEPARTMENT_UPDATED",
        entityType: "department",
        entityId: String(updatedDepartment.departmentId),
        oldValue: buildOrganizationAuditValue({
          id: existingDepartment.departmentId,
          name: existingDepartment.name,
          status: existingDepartment.status,
        }),
        newValue: buildOrganizationAuditValue({
          id: updatedDepartment.departmentId,
          name: updatedDepartment.name,
          status: updatedDepartment.status,
        }),
      },
    });
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/departments");

  return {
    ok: true,
    message: "Department updated successfully.",
  };
}