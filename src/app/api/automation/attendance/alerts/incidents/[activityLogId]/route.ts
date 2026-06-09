import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  getAttendanceAutomationAlertSnapshotDetailData,
  parseAttendanceAutomationAlertSnapshotActivityLogId,
} from "@/features/attendance/automation/alerts/incidents/detail/server/attendance-automation-alert-snapshot-detail-queries";
import { authorizeAutomationRequest } from "@/lib/security/automation-request-auth";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type AttendanceAutomationAlertSnapshotApiContext = {
  params: Promise<{
    activityLogId: string;
  }>;
};

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

async function handleSnapshotDetailRequest(
  request: NextRequest,
  context:
    AttendanceAutomationAlertSnapshotApiContext,
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
          "Unauthorized automation alert snapshot detail request.",

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

  const params =
    await context.params;

  const activityLogId =
    parseAttendanceAutomationAlertSnapshotActivityLogId(
      params.activityLogId,
    );

  if (activityLogId === null) {
    return jsonResponse(
      {
        ok: false,

        message:
          "activityLogId must be a positive integer.",
      },
      400,
    );
  }

  try {
    const data =
      await getAttendanceAutomationAlertSnapshotDetailData(
        activityLogId,
      );

    if (!data) {
      return jsonResponse(
        {
          ok: false,

          message:
            "The requested automation alert snapshot was not found.",
        },
        404,
      );
    }

    return jsonResponse(
      {
        ok: true,

        generatedAt:
          data.generatedAtIso,

        activityLogId:
          data.snapshot.activityLogId,

        overallStatus:
          data.snapshot.overallStatus,

        changeCount:
          data.comparison.totalChanges,

        message:
          "Automation alert snapshot detail was retrieved successfully.",

        data,
      },
      200,
    );
  } catch (error) {
    console.error(
      "Unable to retrieve automation alert snapshot detail:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        message:
          "Automation alert snapshot detail could not be retrieved.",

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
  context:
    AttendanceAutomationAlertSnapshotApiContext,
): Promise<NextResponse> {
  return handleSnapshotDetailRequest(
    request,
    context,
  );
}

export async function POST(
  request: NextRequest,
  context:
    AttendanceAutomationAlertSnapshotApiContext,
): Promise<NextResponse> {
  return handleSnapshotDetailRequest(
    request,
    context,
  );
}