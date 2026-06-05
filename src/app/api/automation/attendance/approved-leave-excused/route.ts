import {
  NextRequest,
  NextResponse,
} from "next/server";
import { runApprovedLeaveExcusedAutomation } from "@/features/attendance/automation/server/approved-leave-excused-automation-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getExpectedSecret(): string | null {
  const secret =
    process.env.ATTENDANCE_AUTOMATION_SECRET ??
    process.env.CRON_SECRET;

  return secret?.trim() || null;
}

function isAuthorized(
  request: NextRequest,
): boolean {
  const expectedSecret = getExpectedSecret();

  if (!expectedSecret) {
    return false;
  }

  const authorization =
    request.headers.get("authorization");

  return (
    authorization ===
    `Bearer ${expectedSecret}`
  );
}

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

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.min(parsed, 500);
}

async function handleAutomationRequest(
  request: NextRequest,
) {
  const expectedSecret = getExpectedSecret();

  if (!expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Attendance automation secret is not configured.",
      },
      {
        status: 503,
      },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized automation request.",
      },
      {
        status: 401,
      },
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

    return NextResponse.json({
      ok: true,
      message:
        "Approved-leave EXCUSED automation completed.",
      result,
    });
  } catch (error) {
    console.error(
      "Approved-leave EXCUSED automation failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "Approved-leave EXCUSED automation failed.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(
  request: NextRequest,
) {
  return handleAutomationRequest(request);
}

export async function POST(
  request: NextRequest,
) {
  return handleAutomationRequest(request);
}