import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAttendanceAutomationReadinessData } from "@/features/attendance/automation/readiness/server/attendance-automation-readiness";
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

async function handleReadinessRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const authorization =
    authorizeAutomationRequest(request);

  if (!authorization.configured) {
    return jsonResponse(
      {
        ok: false,
        ready: false,
        requiresAttention: true,

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
        requiresAttention: true,

        message:
          "Unauthorized automation readiness request.",

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
      await getAttendanceAutomationReadinessData();

    const blocked =
      data.overallStatus === "BLOCKED";

    return jsonResponse(
      {
        ok: !blocked,

        ready:
          data.overallStatus === "READY",

        requiresAttention:
          data.overallStatus !== "READY",

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
      "Attendance automation readiness check failed:",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        ready: false,
        requiresAttention: true,

        status: "BLOCKED",

        message:
          "Attendance automation readiness could not be evaluated.",
      },
      500,
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return handleReadinessRequest(request);
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleReadinessRequest(request);
}