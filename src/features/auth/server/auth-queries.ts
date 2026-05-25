import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function findUserForLogin(login: string) {
  const normalizedLogin = login.trim();

  return prisma.user.findFirst({
    where: {
      OR: [
        {
          username: normalizedLogin,
        },
        {
          email: normalizedLogin.toLowerCase(),
        },
      ],
    },
    select: {
      userId: true,
      empId: true,
      username: true,
      email: true,
      passwordHash: true,
      mustChangePassword: true,
      failedAttempts: true,
      isLocked: true,
      lockoutUntil: true,
      status: true,
      role: {
        select: {
          code: true,
          name: true,
          status: true,
        },
      },
      employee: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          status: true,
        },
      },
    },
  });
}

export async function resetLoginFailures(userId: number) {
  return prisma.user.update({
    where: {
      userId,
    },
    data: {
      failedAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

export async function registerFailedLogin(input: {
  userId: number;
  failedAttempts: number;
  maxFailedAttempts: number;
  lockoutMinutes: number;
}) {
  const nextFailedAttempts = input.failedAttempts + 1;
  const shouldLock = nextFailedAttempts >= input.maxFailedAttempts;

  const lockoutUntil = shouldLock
    ? new Date(Date.now() + input.lockoutMinutes * 60 * 1000)
    : null;

  await prisma.user.update({
    where: {
      userId: input.userId,
    },
    data: {
      failedAttempts: nextFailedAttempts,
      isLocked: shouldLock,
      lockoutUntil,
    },
  });

  return {
    nextFailedAttempts,
    shouldLock,
    lockoutUntil,
  };
}

export async function createAuthActivityLog(input: {
  actorUserId?: number | null;
  action: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  newValue?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        entityType: "auth",
        entityId: input.entityId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        newValue: input.newValue,
      },
    });
  } catch {
    // Auth flow must not fail only because audit logging failed.
  }
}