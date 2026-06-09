import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAttendanceAutomationCronReliabilityData } from "@/features/attendance/automation/scheduler/reliability/server/attendance-automation-cron-reliability-queries";
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

async function handleReliabilityRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const authorization =
    authorizeAutomationRequest(
      request,
    );

  if (!authorization.configured) {
    return jsonResponse(
      {
        ok: false,

        status: "AT_RISK",

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

        message:
          "Unauthorized scheduler reliability request.",

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
      await getAttendanceAutomationCronReliabilityData();

    const breached =
      data.overallStatus ===
      "BREACHED";

    return jsonResponse(
      {
        ok: !breached,

        requiresAttention:
          data.overallStatus ===
            "AT_RISK" ||
          data.overallStatus ===
            "BREACHED",

        checkedAt:
          data.generatedAtIso,

        status:
          data.overallStatus,

        message:
          data.overallDescription,

        data,
      },
      breached ? 503 : 200,
    );
  } catch (error) {
    console.error(
      "Attendance automation scheduler reliability check failed:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        status: "BREACHED",

        message:
          "Scheduler reliability could not be evaluated.",
      },
      500,
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return handleReliabilityRequest(
    request,
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleReliabilityRequest(
    request,
  );
}