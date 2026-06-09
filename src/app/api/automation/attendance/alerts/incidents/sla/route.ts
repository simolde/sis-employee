import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAttendanceAutomationAlertIncidentSlaData } from "@/features/attendance/automation/alerts/incidents/sla/server/attendance-automation-alert-incident-sla-queries";
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

async function handleIncidentSlaRequest(
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

        status:
          "NO_DATA",

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
          "Unauthorized automation incident SLA request.",

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
      await getAttendanceAutomationAlertIncidentSlaData();

    const breached =
      data.overallStatus ===
      "BREACHED";

    return jsonResponse(
      {
        ok: !breached,

        requiresAttention:
          data.overallStatus ===
            "WARNING" ||
          data.overallStatus ===
            "BREACHED",

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
      breached ? 503 : 200,
    );
  } catch (error) {
    console.error(
      "Unable to retrieve automation incident SLA:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        status:
          "BREACHED",

        message:
          "Automation incident SLA could not be evaluated.",

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
  return handleIncidentSlaRequest(
    request,
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleIncidentSlaRequest(
    request,
  );
}