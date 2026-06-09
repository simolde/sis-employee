import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAttendanceAutomationAlertIncidentLifecycleData } from "@/features/attendance/automation/alerts/incidents/lifecycle/server/attendance-automation-alert-incident-lifecycle-queries";
import { authorizeAutomationRequest } from "@/lib/security/automation-request-auth";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function jsonResponse(
  body: object,
  status: number,
): NextResponse {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",

        Pragma:
          "no-cache",

        Expires:
          "0",
      },
    },
  );
}

async function handleLifecycleRequest(
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
          "Unauthorized automation alert incident lifecycle request.",

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
      await getAttendanceAutomationAlertIncidentLifecycleData();

    return jsonResponse(
      {
        ok: true,

        requiresAttention:
          data.overallStatus ===
            "ATTENTION" ||
          data.overallStatus ===
            "CRITICAL",

        generatedAt:
          data.generatedAtIso,

        status:
          data.overallStatus,

        message:
          data.overallDescription,

        summary:
          data.summary,

        data,
      },
      200,
    );
  } catch (error) {
    console.error(
      "Unable to retrieve automation alert incident lifecycle:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        message:
          "Automation alert incident lifecycle could not be retrieved.",

        ...(process.env.NODE_ENV !==
          "production" &&
        error instanceof Error
          ? {
              error:
                error.message,
            }
          : {}),
      },
      500,
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return handleLifecycleRequest(
    request,
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleLifecycleRequest(
    request,
  );
}