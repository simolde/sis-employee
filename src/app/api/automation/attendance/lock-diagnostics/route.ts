import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAttendanceAutomationLockDiagnosticData } from "@/features/attendance/automation/diagnostics/server/attendance-automation-lock-diagnostics";
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

async function handleDiagnosticRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const authorization =
    authorizeAutomationRequest(request);

  if (!authorization.configured) {
    return jsonResponse(
      {
        ok: false,
        requiresAttention: true,

        status: "FAIL",

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

        status: "FAIL",

        message:
          "Unauthorized automation lock diagnostic request.",

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
      await getAttendanceAutomationLockDiagnosticData();

    const failed =
      data.overallStatus === "FAIL";

    return jsonResponse(
      {
        ok: !failed,

        requiresAttention:
          data.overallStatus !== "PASS",

        checkedAt:
          data.checkedAtIso,

        status:
          data.overallStatus,

        message:
          data.statusDescription,

        data,
      },
      failed ? 503 : 200,
    );
  } catch (error) {
    console.error(
      "Attendance automation lock diagnostics failed:",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        requiresAttention: true,

        status: "FAIL",

        message:
          "Attendance automation lock diagnostics could not be completed.",
      },
      500,
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return handleDiagnosticRequest(request);
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleDiagnosticRequest(request);
}