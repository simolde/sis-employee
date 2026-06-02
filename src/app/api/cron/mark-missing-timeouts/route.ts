import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { markEligibleMissingTimeouts } from "@/features/attendance/missing-timeouts/server/missing-timeout-service";

export const dynamic = "force-dynamic";

function getSecretFromRequest(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.replace(/^Bearer\s+/i, "").trim();
  const querySecret = request.nextUrl.searchParams.get("secret");

  return bearerToken || querySecret;
}

function parseLimit(value: string | null): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 200;
  }

  return Math.min(parsed, 500);
}

async function getCronActorUserId(): Promise<number | null> {
  const actorEmail =
    process.env.MISSING_TIMEOUT_CRON_ACTOR_EMAIL ??
    process.env.SEED_ADMIN_EMAIL ??
    "";

  if (!actorEmail.trim()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: actorEmail,
    },
    select: {
      userId: true,
    },
  });

  return user?.userId ?? null;
}

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.MISSING_TIMEOUT_CRON_SECRET;
  const requestSecret = getSecretFromRequest(request);

  if (!configuredSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "MISSING_TIMEOUT_CRON_SECRET is not configured on the server.",
      },
      {
        status: 500,
      },
    );
  }

  if (!requestSecret || requestSecret !== configuredSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized cron request.",
      },
      {
        status: 401,
      },
    );
  }

  const actorUserId = await getCronActorUserId();

  if (!actorUserId) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Cron actor user was not found. Set MISSING_TIMEOUT_CRON_ACTOR_EMAIL or SEED_ADMIN_EMAIL to an existing admin email.",
      },
      {
        status: 500,
      },
    );
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  const result = await markEligibleMissingTimeouts({
    actorUserId,
    limit,
  });

  return NextResponse.json({
    ok: true,
    message:
      result.markedCount > 0
        ? `${result.markedCount} attendance record(s) marked as missing timeout.`
        : "No eligible missing timeout records found.",
    markedCount: result.markedCount,
    remainingEligibleCount: result.remainingEligibleCount,
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}