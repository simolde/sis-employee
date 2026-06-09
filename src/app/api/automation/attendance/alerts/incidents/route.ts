import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAttendanceAutomationAlertIncidentData } from "@/features/attendance/automation/alerts/incidents/server/attendance-automation-alert-incident-queries";
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

async function handleIncidentHistoryRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const authorization =
    authorizeAutomationRequest(
      request,
    );

  if (
    !authorization.configured
  ) {
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

  if (
    !authorization.authorized
  ) {
    return jsonResponse(
      {
        ok: false,

        message:
          "Unauthorized automation alert incident history request.",

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
      await getAttendanceAutomationAlertIncidentData();

    return jsonResponse(
      {
        ok: true,

        hasSnapshot:
          data.latestSnapshot !==
          null,

        snapshotStale:
          data.summary
            .snapshotStale,

        generatedAt:
          data.generatedAtIso,

        message:
          data.latestSnapshot
            ? data.summary.snapshotStale
              ? "Automation alert incident history was retrieved, but the latest snapshot is stale."
              : "Automation alert incident history was retrieved successfully."
            : "Automation alert incident history was retrieved, but no snapshot has been recorded.",

        data,
      },
      200,
    );
  } catch (error) {
    console.error(
      "Unable to retrieve automation alert incident history:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        message:
          "Automation alert incident history could not be retrieved.",

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
  return handleIncidentHistoryRequest(
    request,
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleIncidentHistoryRequest(
    request,
  );
}