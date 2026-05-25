import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/security/password";
import { formatFullName } from "@/lib/utils/formatting";
import { isSystemRole } from "@/lib/security/roles";
import {
  createAuthActivityLog,
  findUserForLogin,
  registerFailedLogin,
  resetLoginFailures,
} from "@/features/auth/server/auth-queries";
import {
  createSessionForUser,
  setSessionCookie,
} from "@/features/auth/server/session";
import { loginValidationSchema } from "@/features/auth/validators/login-validation";
import type { LoginResponse } from "@/features/auth/types/auth-types";

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

function jsonResponse(body: LoginResponse, status: number) {
  return NextResponse.json(body, {
    status,
  });
}

function getRemainingLockoutSeconds(lockoutUntil: Date): number {
  return Math.max(1, Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000));
}

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get("user-agent");

  const rawBody = await request.json().catch(() => null);
  const parsed = loginValidationSchema.safeParse(rawBody);

  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        message: "Please enter your username/email and password.",
      },
      400,
    );
  }

  const user = await findUserForLogin(parsed.data.login);

  if (!user) {
    await createAuthActivityLog({
      action: "LOGIN_FAILED_UNKNOWN_USER",
      ipAddress,
      userAgent,
      newValue: {
        login: parsed.data.login,
      },
    });

    return jsonResponse(
      {
        ok: false,
        message: "Invalid username/email or password.",
      },
      401,
    );
  }

  if (user.status !== "ACTIVE") {
    await createAuthActivityLog({
      actorUserId: user.userId,
      action: "LOGIN_BLOCKED_INACTIVE_USER",
      entityId: String(user.userId),
      ipAddress,
      userAgent,
    });

    return jsonResponse(
      {
        ok: false,
        message: "Your account is inactive. Please contact HR/Admin.",
      },
      403,
    );
  }

  if (user.role.status !== "ACTIVE" || !isSystemRole(user.role.code)) {
    await createAuthActivityLog({
      actorUserId: user.userId,
      action: "LOGIN_BLOCKED_INVALID_ROLE",
      entityId: String(user.userId),
      ipAddress,
      userAgent,
    });

    return jsonResponse(
      {
        ok: false,
        message: "Your account role is not allowed to login.",
      },
      403,
    );
  }

  if (user.isLocked && user.lockoutUntil && user.lockoutUntil > new Date()) {
    return jsonResponse(
      {
        ok: false,
        message: "Too many failed login attempts. Account is temporarily locked.",
        remainingSeconds: getRemainingLockoutSeconds(user.lockoutUntil),
      },
      423,
    );
  }

  const passwordOk = await verifyPassword({
    password: parsed.data.password,
    passwordHash: user.passwordHash,
  });

  if (!passwordOk) {
    const failedResult = await registerFailedLogin({
      userId: user.userId,
      failedAttempts: user.failedAttempts,
      maxFailedAttempts: env.LOGIN_MAX_FAILED_ATTEMPTS,
      lockoutMinutes: env.LOGIN_LOCKOUT_MINUTES,
    });

    await createAuthActivityLog({
      actorUserId: user.userId,
      action: failedResult.shouldLock
        ? "LOGIN_FAILED_ACCOUNT_LOCKED"
        : "LOGIN_FAILED_BAD_PASSWORD",
      entityId: String(user.userId),
      ipAddress,
      userAgent,
      newValue: {
        failedAttempts: failedResult.nextFailedAttempts,
        lockoutUntil: failedResult.lockoutUntil?.toISOString() ?? null,
      },
    });

    if (failedResult.shouldLock && failedResult.lockoutUntil) {
      return jsonResponse(
        {
          ok: false,
          message:
            "Too many failed login attempts. Account is temporarily locked.",
          remainingSeconds: getRemainingLockoutSeconds(
            failedResult.lockoutUntil,
          ),
        },
        423,
      );
    }

    return jsonResponse(
      {
        ok: false,
        message: "Invalid username/email or password.",
      },
      401,
    );
  }

  await resetLoginFailures(user.userId);

  const displayName = user.employee
    ? formatFullName({
        firstName: user.employee.firstName,
        middleName: user.employee.middleName,
        lastName: user.employee.lastName,
      })
    : user.username;

  const session = createSessionForUser({
    userId: user.userId,
    empId: user.empId,
    username: user.username,
    email: user.email,
    role: user.role.code,
    roleName: user.role.name,
    name: displayName,
    mustChangePassword: user.mustChangePassword,
  });

  await createAuthActivityLog({
    actorUserId: user.userId,
    action: "LOGIN_SUCCESS",
    entityId: String(user.userId),
    ipAddress,
    userAgent,
  });

  const response = jsonResponse(
    {
      ok: true,
      message: "Login successful.",
      redirectTo: "/dashboard",
    },
    200,
  );

  setSessionCookie(response, session);

  return response;
}