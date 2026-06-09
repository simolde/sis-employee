import type {
  AttendanceAutomationSchedulerHeartbeatOutcome,
  AttendanceAutomationSchedulerHeartbeatTask,
} from "../types/attendance-automation-scheduler-heartbeat-types";

const MAXIMUM_MESSAGE_LENGTH = 500;
const MAXIMUM_EXECUTION_ID_LENGTH = 120;

const MAXIMUM_DURATION_MS =
  24 * 60 * 60 * 1000;

const MAXIMUM_FUTURE_TOLERANCE_MS =
  10 * 60 * 1000;

const EXECUTION_ID_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

export type AttendanceAutomationSchedulerHeartbeatPayload = {
  executionId: string;

  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  outcome:
    AttendanceAutomationSchedulerHeartbeatOutcome;

  httpStatus: number | null;

  startedAt: Date;
  finishedAt: Date;

  message: string | null;
};

export type AttendanceAutomationSchedulerHeartbeatPayloadResult =
  | {
      ok: true;

      payload:
        AttendanceAutomationSchedulerHeartbeatPayload;
    }
  | {
      ok: false;

      errors: string[];
    };

function formDataString(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function parseExecutionId(
  value: string,
): string | null {
  if (
    !value ||
    value.length >
      MAXIMUM_EXECUTION_ID_LENGTH ||
    !EXECUTION_ID_PATTERN.test(value)
  ) {
    return null;
  }

  return value;
}

function parseTask(
  value: string,
): AttendanceAutomationSchedulerHeartbeatTask | null {
  const normalized =
    value.trim().toUpperCase();

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
    value.trim().toUpperCase();

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
): number | null | undefined {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 100 ||
    parsed > 599
  ) {
    return undefined;
  }

  return parsed;
}

function parseDate(
  value: string,
): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(
    parsed.getTime(),
  )
    ? null
    : parsed;
}

function normalizeMessage(
  value: string,
): string | null {
  const normalized = value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAXIMUM_MESSAGE_LENGTH);

  return normalized || null;
}

function validateTimeline(input: {
  startedAt: Date;
  finishedAt: Date;
}): string[] {
  const errors: string[] = [];

  const durationMs =
    input.finishedAt.getTime() -
    input.startedAt.getTime();

  if (durationMs < 0) {
    errors.push(
      "finishedAt cannot be earlier than startedAt.",
    );
  }

  if (
    durationMs >
    MAXIMUM_DURATION_MS
  ) {
    errors.push(
      "The scheduler execution duration cannot exceed 24 hours.",
    );
  }

  const latestAllowedTime =
    Date.now() +
    MAXIMUM_FUTURE_TOLERANCE_MS;

  if (
    input.startedAt.getTime() >
    latestAllowedTime
  ) {
    errors.push(
      "startedAt is too far in the future.",
    );
  }

  if (
    input.finishedAt.getTime() >
    latestAllowedTime
  ) {
    errors.push(
      "finishedAt is too far in the future.",
    );
  }

  return errors;
}

export function parseAttendanceAutomationSchedulerHeartbeatFormData(
  formData: FormData,
): AttendanceAutomationSchedulerHeartbeatPayloadResult {
  const errors: string[] = [];

  const executionId =
    parseExecutionId(
      formDataString(
        formData,
        "executionId",
      ),
    );

  const task = parseTask(
    formDataString(
      formData,
      "task",
    ),
  );

  const outcome = parseOutcome(
    formDataString(
      formData,
      "outcome",
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

  const startedAt = parseDate(
    formDataString(
      formData,
      "startedAt",
    ),
  );

  const finishedAt = parseDate(
    formDataString(
      formData,
      "finishedAt",
    ),
  );

  if (!executionId) {
    errors.push(
      "executionId is required, must begin with an alphanumeric character, and may contain only letters, numbers, periods, underscores, colons, or hyphens.",
    );
  }

  if (!task) {
    errors.push(
      "task must be AUTOMATION or HEALTH.",
    );
  }

  if (!outcome) {
    errors.push(
      "outcome must be SUCCESS, ATTENTION, SKIPPED, or FAILED.",
    );
  }

  if (
    rawHttpStatus &&
    httpStatus === undefined
  ) {
    errors.push(
      "httpStatus must be an integer from 100 through 599.",
    );
  }

  if (!startedAt) {
    errors.push(
      "startedAt must be a valid ISO date and time.",
    );
  }

  if (!finishedAt) {
    errors.push(
      "finishedAt must be a valid ISO date and time.",
    );
  }

  if (startedAt && finishedAt) {
    errors.push(
      ...validateTimeline({
        startedAt,
        finishedAt,
      }),
    );
  }

  if (
    errors.length > 0 ||
    !executionId ||
    !task ||
    !outcome ||
    !startedAt ||
    !finishedAt ||
    httpStatus === undefined
  ) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,

    payload: {
      executionId,

      task,
      outcome,
      httpStatus,

      startedAt,
      finishedAt,

      message:
        normalizeMessage(
          formDataString(
            formData,
            "message",
          ),
        ),
    },
  };
}