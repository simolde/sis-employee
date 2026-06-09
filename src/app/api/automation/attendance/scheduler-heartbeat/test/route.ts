import {
  NextRequest,
  NextResponse,
} from "next/server";
import { parseAttendanceAutomationSchedulerHeartbeatFormData } from "@/features/attendance/automation/scheduler/heartbeats/server/attendance-automation-scheduler-heartbeat-request";
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
        persisted: false,

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
        persisted: false,

        message:
          "Unauthorized scheduler heartbeat test request.",

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

  let formData: FormData;

  try {
    formData =
      await request.formData();
  } catch {
    return jsonResponse(
      {
        ok: false,
        persisted: false,

        message:
          "The request body must use form-data or application/x-www-form-urlencoded.",
      },
      400,
    );
  }

  const parsed =
    parseAttendanceAutomationSchedulerHeartbeatFormData(
      formData,
    );

  if (!parsed.ok) {
    return jsonResponse(
      {
        ok: false,
        persisted: false,

        message:
          "The scheduler heartbeat test payload is invalid.",

        errors:
          parsed.errors,
      },
      400,
    );
  }

  const durationMs =
    parsed.payload.finishedAt.getTime() -
    parsed.payload.startedAt.getTime();

  const receiptKeyPreview = [
    "HOSTINGER_CRON",
    parsed.payload.task,
    parsed.payload.executionId,
  ].join(":");

  return jsonResponse(
    {
      ok: true,

      persisted: false,

      message:
        "Scheduler heartbeat authentication and payload validation passed. No activity log was created.",

      data: {
        executionId:
          parsed.payload.executionId,

        receiptKeyPreview,

        task:
          parsed.payload.task,

        outcome:
          parsed.payload.outcome,

        httpStatus:
          parsed.payload.httpStatus,

        startedAt:
          parsed.payload.startedAt.toISOString(),

        finishedAt:
          parsed.payload.finishedAt.toISOString(),

        durationMs,

        message:
          parsed.payload.message,
      },
    },
    200,
  );
}