import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  buildAttendanceAutomationHealthApiResponse,
  getAttendanceAutomationHealthHttpStatus,
} from "@/features/attendance/automation/health/server/attendance-automation-health-response";
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

async function handleHealthRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const authorization =
    authorizeAutomationRequest(request);

  if (!authorization.configured) {
    return jsonResponse(
      {
        ok: false,
        status: "NOT_CONFIGURED",
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
          "Unauthorized automation health request.",
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
      await buildAttendanceAutomationHealthApiResponse();

    const status =
      getAttendanceAutomationHealthHttpStatus(
        response.status,
      );

    return jsonResponse(
      response,
      status,
    );
  } catch (error) {
    console.error(
      "Attendance automation health check failed:",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        status: "DEGRADED",
        message:
          "Attendance automation health could not be evaluated.",
      },
      500,
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return handleHealthRequest(request);
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleHealthRequest(request);
}