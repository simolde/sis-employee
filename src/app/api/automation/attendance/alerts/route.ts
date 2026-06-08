import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  buildAttendanceAutomationAlertApiResponse,
  getAttendanceAutomationAlertHttpStatus,
} from "@/features/attendance/automation/alerts/server/attendance-automation-alert-response";
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

async function handleAlertRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const authorization =
    authorizeAutomationRequest(request);

  if (!authorization.configured) {
    return jsonResponse(
      {
        ok: false,
        requiresAttention: true,
        status: "CRITICAL",

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
        requiresAttention: true,

        message:
          "Unauthorized automation alert request.",

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
    const response =
      await buildAttendanceAutomationAlertApiResponse();

    const status =
      getAttendanceAutomationAlertHttpStatus(
        response.status,
      );

    return jsonResponse(
      response,
      status,
    );
  } catch (error) {
    console.error(
      "Attendance automation alert evaluation failed:",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        requiresAttention: true,
        status: "CRITICAL",

        message:
          "Attendance automation alerts could not be evaluated.",
      },
      500,
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return handleAlertRequest(request);
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleAlertRequest(request);
}