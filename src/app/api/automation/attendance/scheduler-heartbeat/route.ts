import {
  NextRequest,
  NextResponse,
} from "next/server";
import { recordAttendanceAutomationSchedulerHeartbeat } from "@/features/attendance/automation/scheduler/heartbeats/server/attendance-automation-scheduler-heartbeat-service";
import type {
  AttendanceAutomationSchedulerHeartbeatOutcome,
  AttendanceAutomationSchedulerHeartbeatTask,
} from "@/features/attendance/automation/scheduler/heartbeats/types/attendance-automation-scheduler-heartbeat-types";
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

function formDataString(
  formData: FormData,
  key: string,
): string {
  const value =
    formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function parseTask(
  value: string,
): AttendanceAutomationSchedulerHeartbeatTask | null {
  const normalized =
    value.toUpperCase();

  if (
    normalized === "AUTOMATION" ||
    normalized === "HEALTH"
  ) {
    return normalized;
  }

  return null;
}

function parseOutcome(
  value: string,
): AttendanceAutomationSchedulerHeartbeatOutcome | null {
  const normalized =
    value.toUpperCase();

  if (
    normalized === "SUCCESS" ||
    normalized === "ATTENTION" ||
    normalized === "SKIPPED" ||
    normalized === "FAILED"
  ) {
    return normalized;
  }

  return null;
}

function parseHttpStatus(
  value: string,
): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 100 ||
    parsed > 599
  ) {
    return null;
  }

  return parsed;
}

function parseRequiredDate(
  value: string,
): Date | null {
  const parsed = new Date(value);

  return Number.isNaN(
    parsed.getTime(),
  )
    ? null
    : parsed;
}

export async function POST(
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
          "Unauthorized scheduler heartbeat request.",

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
    const formData =
      await request.formData();

    const task = parseTask(
      formDataString(
        formData,
        "task",
      ),
    );

    const outcome =
      parseOutcome(
        formDataString(
          formData,
          "outcome",
        ),
      );

    const startedAt =
      parseRequiredDate(
        formDataString(
          formData,
          "startedAt",
        ),
      );

    const finishedAt =
      parseRequiredDate(
        formDataString(
          formData,
          "finishedAt",
        ),
      );

    const rawHttpStatus =
      formDataString(
        formData,
        "httpStatus",
      );

    const httpStatus =
      parseHttpStatus(
        rawHttpStatus,
      );

    const message =
      formDataString(
        formData,
        "message",
      );

    if (
      !task ||
      !outcome ||
      !startedAt ||
      !finishedAt
    ) {
      return jsonResponse(
        {
          ok: false,

          message:
            "task, outcome, startedAt, and finishedAt must contain valid values.",
        },
        400,
      );
    }

    if (
      rawHttpStatus &&
      httpStatus === null
    ) {
      return jsonResponse(
        {
          ok: false,

          message:
            "httpStatus must be an HTTP status from 100 through 599.",
        },
        400,
      );
    }

    const receipt =
      await recordAttendanceAutomationSchedulerHeartbeat(
        {
          task,
          outcome,
          httpStatus,
          startedAt,
          finishedAt,

          message:
            message || null,
        },
      );

    return jsonResponse(
      {
        ok: true,

        message:
          "Scheduler heartbeat receipt recorded.",

        data: {
          activityLogId:
            receipt.activityLogId,

          receiptKey:
            receipt.receiptKey,

          durationMs:
            receipt.durationMs,
        },
      },
      201,
    );
  } catch (error) {
    console.error(
      "Unable to record attendance automation scheduler heartbeat:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        message:
          error instanceof Error
            ? error.message
            : "The scheduler heartbeat could not be recorded.",
      },
      500,
    );
  }
}