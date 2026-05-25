import { NextResponse } from "next/server";
import { createAuthActivityLog } from "@/features/auth/server/auth-queries";
import {
  clearSessionCookie,
  getSessionFromCookie,
} from "@/features/auth/server/session";
import type { LoginResponse } from "@/features/auth/types/auth-types";

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  const session = await getSessionFromCookie();

  if (session) {
    await createAuthActivityLog({
      actorUserId: session.userId,
      action: "LOGOUT",
      entityId: String(session.userId),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
  }

  const response = NextResponse.json(
    {
      ok: true,
      message: "Logout successful.",
      redirectTo: "/login",
    } satisfies LoginResponse,
    {
      status: 200,
    },
  );

  clearSessionCookie(response);

  return response;
}