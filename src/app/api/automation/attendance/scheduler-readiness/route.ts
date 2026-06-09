import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAttendanceAutomationCronReadinessData } from "@/features/attendance/automation/scheduler/readiness/server/attendance-automation-cron-readiness-queries";
import { authorizeAutomationRequest } from "@/lib/security/automation-request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(
  body: object,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",

      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

async function handleSchedulerReadinessRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const authorization =
    authorizeAutomationRequest(request);

  if (!authorization.configured) {
    return jsonResponse(
      {
        ok: false,
        ready: false,
        monitoringEnabled: false,

        status: "BLOCKED",

        message:
          "Attendance automation secret is not configured.",

        ...(process.env.NODE_ENV !==
        "production"
          ? {
              diagnostics:
                authorization.diagnostics,
            }
          : {}),
      },
      503,
    );
  }

  if (!authorization.authorized) {
    return jsonResponse(
      {
        ok: false,
        ready: false,

        message:
          "Unauthorized scheduler readiness request.",

        ...(process.env.NODE_ENV !==
        "production"
          ? {
              diagnostics:
                authorization.diagnostics,
            }
          : {}),
      },
      401,
    );
  }

  try {
    const data =
      await getAttendanceAutomationCronReadinessData();

    const blocked =
      data.overallStatus ===
      "BLOCKED";

    return jsonResponse(
      {
        ok: !blocked,

        ready:
          data.overallStatus ===
          "READY",

        monitoringEnabled:
          data.monitoring.enabled,

        requiresAttention:
          data.overallStatus ===
            "BLOCKED" ||
          data.overallStatus ===
            "READY_WITH_WARNINGS",

        checkedAt:
          data.checkedAtIso,

        status:
          data.overallStatus,

        message:
          data.overallDescription,

        data,
      },
      blocked ? 503 : 200,
    );
  } catch (error) {
    console.error(
      "Attendance automation scheduler readiness check failed:",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        ready: false,
        monitoringEnabled: false,

        status: "BLOCKED",

        message:
          "Scheduler readiness could not be evaluated.",
      },
      500,
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return handleSchedulerReadinessRequest(
    request,
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleSchedulerReadinessRequest(
    request,
  );
}