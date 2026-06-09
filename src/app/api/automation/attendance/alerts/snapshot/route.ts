import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAttendanceAutomationAlertCenterData } from "@/features/attendance/automation/alerts/server/attendance-automation-alert-queries";
import { recordAttendanceAutomationAlertSnapshot } from "@/features/attendance/automation/alerts/incidents/server/attendance-automation-alert-snapshot-service";
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

export async function POST(
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
          "Unauthorized automation alert snapshot request.",

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
    const alertCenter =
      await getAttendanceAutomationAlertCenterData();

    const snapshot =
      await recordAttendanceAutomationAlertSnapshot(
        alertCenter,
      );

    return jsonResponse(
      {
        ok: true,

        duplicate:
          snapshot.duplicate,

        message:
          snapshot.duplicate
            ? "The active automation alert state has not changed. The latest snapshot was reused."
            : "A new automation alert snapshot was recorded.",

        data: {
          activityLogId:
            snapshot.activityLogId,

          snapshotKey:
            snapshot.snapshotKey,

          fingerprint:
            snapshot.fingerprint,

          overallStatus:
            snapshot.overallStatus,

          summary:
            snapshot.summary,
        },
      },
      snapshot.duplicate
        ? 200
        : 201,
    );
  } catch (error) {
    console.error(
      "Unable to record automation alert snapshot:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        message:
          "The automation alert snapshot could not be recorded.",

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