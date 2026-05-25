import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { env, isProduction } from "@/lib/env";
import { formatFullName } from "@/lib/utils/formatting";
import { isSystemRole } from "@/lib/security/roles";
import type { AuthSession } from "../types/auth-types";

type RawSessionPayload = AuthSession;

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signSessionPayload(payloadBase64: string): string {
  return createHmac("sha256", env.SESSION_SECRET)
    .update(payloadBase64)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function createSessionToken(session: AuthSession): string {
  const payloadBase64 = encodeBase64Url(JSON.stringify(session));
  const signature = signSessionPayload(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): AuthSession | null {
  const [payloadBase64, signature] = token.split(".");

  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = signSessionPayload(payloadBase64);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(payloadBase64),
    ) as RawSessionPayload;

    if (!payload.userId || !payload.email || !payload.role || !payload.expiresAt) {
      return null;
    }

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    if (!isSystemRole(payload.role)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionMaxAgeSeconds(): number {
  return env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60;
}

export function setSessionCookie(response: NextResponse, session: AuthSession) {
  const token = createSessionToken(session);

  response.cookies.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(env.SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookie(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieSession = await getSessionFromCookie();

  if (!cookieSession) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      userId: cookieSession.userId,
    },
    select: {
      userId: true,
      empId: true,
      username: true,
      email: true,
      mustChangePassword: true,
      status: true,
      isLocked: true,
      lockoutUntil: true,
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

  if (!user) {
    return null;
  }

  if (user.status !== "ACTIVE") {
    return null;
  }

  if (user.role.status !== "ACTIVE") {
    return null;
  }

  if (!isSystemRole(user.role.code)) {
    return null;
  }

  if (user.isLocked && user.lockoutUntil && user.lockoutUntil > new Date()) {
    return null;
  }

  const name = user.employee
    ? formatFullName({
        firstName: user.employee.firstName,
        middleName: user.employee.middleName,
        lastName: user.employee.lastName,
      })
    : user.username;

  return {
    userId: user.userId,
    empId: user.empId,
    username: user.username,
    email: user.email,
    role: user.role.code,
    roleName: user.role.name,
    name,
    mustChangePassword: user.mustChangePassword,
    issuedAt: cookieSession.issuedAt,
    expiresAt: cookieSession.expiresAt,
  };
}

export function createSessionForUser(input: {
  userId: number;
  empId: number | null;
  username: string;
  email: string;
  role: AuthSession["role"];
  roleName: string;
  name: string;
  mustChangePassword: boolean;
}): AuthSession {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + getSessionMaxAgeSeconds() * 1000;

  return {
    userId: input.userId,
    empId: input.empId,
    username: input.username,
    email: input.email,
    role: input.role,
    roleName: input.roleName,
    name: input.name,
    mustChangePassword: input.mustChangePassword,
    issuedAt,
    expiresAt,
  };
}