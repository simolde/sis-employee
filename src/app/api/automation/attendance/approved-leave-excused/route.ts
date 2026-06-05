import {
  NextRequest,
  NextResponse,
} from "next/server";
import { runApprovedLeaveExcusedAutomation } from "@/features/attendance/automation/server/approved-leave-excused-automation-runner";
import { ApprovedLeaveExcusedAutomationExecutionError } from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-service";
import { authorizeAutomationRequest } from "@/lib/security/automation-request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDateInput(
  value: string | null,
): string | undefined {
  if (
    value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  return undefined;
}

function parseLimit(
  value: string | null,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return undefined;
  }

  return Math.min(parsed, 500);
}

function jsonResponse(
  body: object,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",
    },
  });
}

async function handleAutomationRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const authorization =
    authorizeAutomationRequest(request);

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
          "Unauthorized automation request.",
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
    const result =
      await runApprovedLeaveExcusedAutomation({
        dateFrom: parseDateInput(
          request.nextUrl.searchParams.get(
            "dateFrom",
          ),
        ),
        dateTo: parseDateInput(
          request.nextUrl.searchParams.get(
            "dateTo",
          ),
        ),
        limit: parseLimit(
          request.nextUrl.searchParams.get(
            "limit",
          ),
        ),
      });

    return jsonResponse({
      ok: true,
      message:
        "Approved-leave EXCUSED automation completed.",
      result,
    });
  } catch (error) {
    if (
      error instanceof
      ApprovedLeaveExcusedAutomationExecutionError
    ) {
      console.error(
        "Approved-leave EXCUSED automation failed:",
        error,
      );

      return jsonResponse(
        {
          ok: false,
          message: error.message,
          runAuditLogId:
            error.runAuditLogId,
        },
        500,
      );
    }

    console.error(
      "Approved-leave EXCUSED automation failed unexpectedly:",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "Approved-leave EXCUSED automation failed unexpectedly.",
        runAuditLogId: null,
      },
      500,
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return handleAutomationRequest(request);
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return handleAutomationRequest(request);
}