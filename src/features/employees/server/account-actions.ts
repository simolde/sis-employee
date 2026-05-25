"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, validatePasswordStrength } from "@/lib/security/password";
import { canManageEmployees } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createEmployeeAccountValidationSchema,
  resetEmployeePasswordValidationSchema,
} from "../validators/account-validation";

export type EmployeeAccountActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialEmployeeAccountActionState: EmployeeAccountActionState = {
  ok: false,
  message: "",
};

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function parsePositiveId(value: string | number): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

async function requireAccountManagerSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      session,
      error: {
        ok: false,
        message: "You do not have permission to manage employee accounts.",
      } satisfies EmployeeAccountActionState,
    };
  }

  return {
    session,
    error: null,
  };
}

function validateTemporaryPassword(
  password: string,
): EmployeeAccountActionState | null {
  const strength = validatePasswordStrength(password);

  if (!strength.ok) {
    return {
      ok: false,
      message: strength.message,
      fieldErrors: {
        temporaryPassword: [strength.message],
      },
    };
  }

  return null;
}

function buildAccountAuditValue(input: {
  userId: number;
  empId: number | null;
  username: string;
  email: string;
  roleId: number;
  roleCode?: string;
  status: string;
  mustChangePassword: boolean;
  failedAttempts: number;
  isLocked: boolean;
  lockoutUntil: Date | null;
}): Prisma.InputJsonObject {
  return {
    userId: input.userId,
    empId: input.empId,
    username: input.username,
    email: input.email,
    roleId: input.roleId,
    roleCode: input.roleCode ?? null,
    status: input.status,
    mustChangePassword: input.mustChangePassword,
    failedAttempts: input.failedAttempts,
    isLocked: input.isLocked,
    lockoutUntil: input.lockoutUntil?.toISOString() ?? null,
  };
}

export async function createEmployeeAccountAction(
  empId: string,
  _previousState: EmployeeAccountActionState,
  formData: FormData,
): Promise<EmployeeAccountActionState> {
  const employeeId = parsePositiveId(empId);

  if (!employeeId) {
    return {
      ok: false,
      message: "Invalid employee ID.",
    };
  }

  const auth = await requireAccountManagerSession();

  if (auth.error) {
    return auth.error;
  }

  const parsed = createEmployeeAccountValidationSchema.safeParse(
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
  const passwordError = validateTemporaryPassword(data.temporaryPassword);

  if (passwordError) {
    return passwordError;
  }

  const employee = await prisma.employee.findUnique({
    where: {
      empId: employeeId,
    },
    select: {
      empId: true,
      user: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!employee) {
    return {
      ok: false,
      message: "Employee record was not found.",
    };
  }

  if (employee.user) {
    return {
      ok: false,
      message: "This employee already has a login account.",
    };
  }

  const role = await prisma.role.findUnique({
    where: {
      roleId: data.roleId,
    },
    select: {
      roleId: true,
      code: true,
      name: true,
      status: true,
    },
  });

  if (!role || role.status !== "ACTIVE") {
    return {
      ok: false,
      message: "Selected role is not available.",
      fieldErrors: {
        roleId: ["Selected role is not available."],
      },
    };
  }

  const duplicateUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: data.username,
        },
        {
          email: data.email,
        },
      ],
    },
    select: {
      username: true,
      email: true,
    },
  });

  if (duplicateUser?.username === data.username) {
    return {
      ok: false,
      message: "Username already exists.",
      fieldErrors: {
        username: ["Username already exists."],
      },
    };
  }

  if (duplicateUser?.email === data.email) {
    return {
      ok: false,
      message: "Email address already exists.",
      fieldErrors: {
        email: ["Email address already exists."],
      },
    };
  }

  const passwordHash = await hashPassword(data.temporaryPassword);

  const user = await prisma.user.create({
    data: {
      empId: employeeId,
      username: data.username,
      email: data.email,
      passwordHash,
      roleId: role.roleId,
      mustChangePassword: true,
      failedAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
      status: "ACTIVE",
    },
    select: {
      userId: true,
      empId: true,
      username: true,
      email: true,
      roleId: true,
      status: true,
      mustChangePassword: true,
      failedAttempts: true,
      isLocked: true,
      lockoutUntil: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorUserId: auth.session.userId,
      action: "EMPLOYEE_ACCOUNT_CREATED",
      entityType: "user",
      entityId: String(user.userId),
      newValue: buildAccountAuditValue({
        ...user,
        roleCode: role.code,
      }),
    },
  });

  revalidatePath(`/dashboard/employees/${employeeId}`);

  return {
    ok: true,
    message:
      "Login account created successfully. The employee must change password after login.",
  };
}

export async function resetEmployeePasswordAction(
  userId: string,
  empId: string,
  _previousState: EmployeeAccountActionState,
  formData: FormData,
): Promise<EmployeeAccountActionState> {
  const parsedUserId = parsePositiveId(userId);
  const employeeId = parsePositiveId(empId);

  if (!parsedUserId || !employeeId) {
    return {
      ok: false,
      message: "Invalid account ID.",
    };
  }

  const auth = await requireAccountManagerSession();

  if (auth.error) {
    return auth.error;
  }

  const parsed = resetEmployeePasswordValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const passwordError = validateTemporaryPassword(parsed.data.temporaryPassword);

  if (passwordError) {
    return passwordError;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      userId: parsedUserId,
    },
    select: {
      userId: true,
      empId: true,
      username: true,
      email: true,
      roleId: true,
      status: true,
      mustChangePassword: true,
      failedAttempts: true,
      isLocked: true,
      lockoutUntil: true,
      role: {
        select: {
          code: true,
        },
      },
    },
  });

  if (!existingUser || existingUser.empId !== employeeId) {
    return {
      ok: false,
      message: "Login account was not found for this employee.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.temporaryPassword);

  const updatedUser = await prisma.user.update({
    where: {
      userId: parsedUserId,
    },
    data: {
      passwordHash,
      mustChangePassword: true,
      failedAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
      status: "ACTIVE",
    },
    select: {
      userId: true,
      empId: true,
      username: true,
      email: true,
      roleId: true,
      status: true,
      mustChangePassword: true,
      failedAttempts: true,
      isLocked: true,
      lockoutUntil: true,
      role: {
        select: {
          code: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      actorUserId: auth.session.userId,
      action: "EMPLOYEE_ACCOUNT_PASSWORD_RESET",
      entityType: "user",
      entityId: String(updatedUser.userId),
      oldValue: buildAccountAuditValue({
        ...existingUser,
        roleCode: existingUser.role.code,
      }),
      newValue: buildAccountAuditValue({
        ...updatedUser,
        roleCode: updatedUser.role.code,
      }),
    },
  });

  revalidatePath(`/dashboard/employees/${employeeId}`);

  return {
    ok: true,
    message:
      "Password reset successfully. The employee must change password after login.",
  };
}

export async function unlockEmployeeAccountAction(
  userId: string,
  empId: string,
  previousState: EmployeeAccountActionState,
  formData: FormData,
): Promise<EmployeeAccountActionState> {
  void previousState;
  void formData;
  const parsedUserId = parsePositiveId(userId);
  const employeeId = parsePositiveId(empId);

  if (!parsedUserId || !employeeId) {
    return {
      ok: false,
      message: "Invalid account ID.",
    };
  }

  const auth = await requireAccountManagerSession();

  if (auth.error) {
    return auth.error;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      userId: parsedUserId,
    },
    select: {
      userId: true,
      empId: true,
      username: true,
      email: true,
      roleId: true,
      status: true,
      mustChangePassword: true,
      failedAttempts: true,
      isLocked: true,
      lockoutUntil: true,
      role: {
        select: {
          code: true,
        },
      },
    },
  });

  if (!existingUser || existingUser.empId !== employeeId) {
    return {
      ok: false,
      message: "Login account was not found for this employee.",
    };
  }

  const updatedUser = await prisma.user.update({
    where: {
      userId: parsedUserId,
    },
    data: {
      failedAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
    },
    select: {
      userId: true,
      empId: true,
      username: true,
      email: true,
      roleId: true,
      status: true,
      mustChangePassword: true,
      failedAttempts: true,
      isLocked: true,
      lockoutUntil: true,
      role: {
        select: {
          code: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      actorUserId: auth.session.userId,
      action: "EMPLOYEE_ACCOUNT_UNLOCKED",
      entityType: "user",
      entityId: String(updatedUser.userId),
      oldValue: buildAccountAuditValue({
        ...existingUser,
        roleCode: existingUser.role.code,
      }),
      newValue: buildAccountAuditValue({
        ...updatedUser,
        roleCode: updatedUser.role.code,
      }),
    },
  });

  revalidatePath(`/dashboard/employees/${employeeId}`);

  return {
    ok: true,
    message: "Account unlocked successfully.",
  };
}