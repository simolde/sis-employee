import {
  NextRequest,
  NextResponse,
} from "next/server";
import { recalculateNormalAttendanceStatuses } from "@/features/attendance/status-recalculation/server/attendance-status-recalculation-service";
import { prisma } from "@/lib/db/prisma";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function getSecretFromRequest(
  request: NextRequest,
): string | null {
  const authorization =
    request.headers.get(
      "authorization",
    );

  const bearerToken =
    authorization
      ?.replace(
        /^Bearer\s+/iu,
        "",
      )
      .trim();

  const querySecret =
    request.nextUrl.searchParams.get(
      "secret",
    );

  return (
    bearerToken ||
    querySecret
  );
}

function parseLimit(
  value: string | null,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return 300;
  }

  return Math.min(
    parsed,
    1000,
  );
}

async function getCronActorUserId(): Promise<number | null> {
  const actorEmail =
    process.env
      .ATTENDANCE_STATUS_CRON_ACTOR_EMAIL ??
    process.env
      .MISSING_TIMEOUT_CRON_ACTOR_EMAIL ??
    process.env
      .SEED_ADMIN_EMAIL ??
    "";

  if (
    !actorEmail.trim()
  ) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          actorEmail,
      },

      select: {
        userId: true,
      },
    });

  return (
    user?.userId ??
    null
  );
}

async function handleCronRequest(
  request: NextRequest,
) {
  const configuredSecret =
    process.env
      .ATTENDANCE_STATUS_CRON_SECRET ??
    process.env
      .MISSING_TIMEOUT_CRON_SECRET;

  const requestSecret =
    getSecretFromRequest(
      request,
    );

  if (!configuredSecret) {
    return NextResponse.json(
      {
        ok: false,

        message:
          "ATTENDANCE_STATUS_CRON_SECRET or MISSING_TIMEOUT_CRON_SECRET is not configured on the server.",
      },
      {
        status: 500,
      },
    );
  }

  if (
    !requestSecret ||
    requestSecret !==
      configuredSecret
  ) {
    return NextResponse.json(
      {
        ok: false,

        message:
          "Unauthorized cron request.",
      },
      {
        status: 401,
      },
    );
  }

  const actorUserId =
    await getCronActorUserId();

  if (!actorUserId) {
    return NextResponse.json(
      {
        ok: false,

        message:
          "Cron actor user was not found. Set ATTENDANCE_STATUS_CRON_ACTOR_EMAIL, MISSING_TIMEOUT_CRON_ACTOR_EMAIL, or SEED_ADMIN_EMAIL to an existing admin email.",
      },
      {
        status: 500,
      },
    );
  }

  const limit =
    parseLimit(
      request.nextUrl.searchParams.get(
        "limit",
      ),
    );

  const result =
    await recalculateNormalAttendanceStatuses({
      actorUserId,
      limit,
    });

  return NextResponse.json({
    ok: true,

    message:
      result.updatedCount >
      0
        ? `${result.updatedCount} attendance record(s) recalculated.`
        : "No attendance status changes needed.",

    processedCount:
      result.processedCount,

    updatedCount:
      result.updatedCount,

    skippedCount:
      result.skippedCount,

    policy: {
      lateGraceMinutes:
        result.policy
          .lateGraceMinutes,

      autoMarkMissingTimeout:
        result.policy
          .autoMarkMissingTimeout,

      missingTimeoutMinutes:
        result.policy
          .missingTimeoutMinutes,
    },

    missingTimeoutHandling: {
      handledBy:
        "/api/cron/mark-missing-timeouts",

      statusRecalculationCreatesMissingTimeout:
        false,

      message:
        "Missing timeout assignment is handled exclusively by the canonical missing-timeout automation.",
    },
  });
}

export async function GET(
  request: NextRequest,
) {
  return handleCronRequest(
    request,
  );
}

export async function POST(
  request: NextRequest,
) {
  return handleCronRequest(
    request,
  );
}