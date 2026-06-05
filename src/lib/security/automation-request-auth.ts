import {
  createHash,
  timingSafeEqual,
} from "node:crypto";
import type { NextRequest } from "next/server";

export type AutomationSecretSource =
  | "ATTENDANCE_AUTOMATION_SECRET"
  | "CRON_SECRET";

export type AutomationRequestSecretSource =
  | "authorization"
  | "x-attendance-automation-secret"
  | "x-cron-secret"
  | "missing";

export type AutomationAuthDiagnostics = {
  configured: boolean;
  configuredSource: AutomationSecretSource | null;
  expectedLength: number;
  expectedFingerprint: string | null;
  received: boolean;
  receivedSource: AutomationRequestSecretSource;
  receivedLength: number;
  receivedFingerprint: string | null;
};

export type AutomationAuthorizationResult = {
  configured: boolean;
  authorized: boolean;
  diagnostics: AutomationAuthDiagnostics;
};

type ConfiguredSecret = {
  secret: string;
  source: AutomationSecretSource;
};

type ReceivedSecret = {
  secret: string | null;
  source: AutomationRequestSecretSource;
};

function normalizeSecret(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function getConfiguredSecret(): ConfiguredSecret | null {
  const attendanceAutomationSecret = normalizeSecret(
    process.env.ATTENDANCE_AUTOMATION_SECRET,
  );

  if (attendanceAutomationSecret) {
    return {
      secret: attendanceAutomationSecret,
      source: "ATTENDANCE_AUTOMATION_SECRET",
    };
  }

  const cronSecret = normalizeSecret(
    process.env.CRON_SECRET,
  );

  if (cronSecret) {
    return {
      secret: cronSecret,
      source: "CRON_SECRET",
    };
  }

  return null;
}

function parseBearerToken(
  authorizationHeader: string | null,
): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const match = authorizationHeader.match(
    /^Bearer\s+(.+)$/i,
  );

  return normalizeSecret(match?.[1]);
}

function getReceivedSecret(
  request: NextRequest,
): ReceivedSecret {
  const bearerToken = parseBearerToken(
    request.headers.get("authorization"),
  );

  if (bearerToken) {
    return {
      secret: bearerToken,
      source: "authorization",
    };
  }

  const attendanceAutomationHeader = normalizeSecret(
    request.headers.get(
      "x-attendance-automation-secret",
    ),
  );

  if (attendanceAutomationHeader) {
    return {
      secret: attendanceAutomationHeader,
      source: "x-attendance-automation-secret",
    };
  }

  const cronHeader = normalizeSecret(
    request.headers.get("x-cron-secret"),
  );

  if (cronHeader) {
    return {
      secret: cronHeader,
      source: "x-cron-secret",
    };
  }

  return {
    secret: null,
    source: "missing",
  };
}

function secureSecretEquals(
  expected: string,
  received: string,
): boolean {
  const expectedBuffer = Buffer.from(
    expected,
    "utf8",
  );

  const receivedBuffer = Buffer.from(
    received,
    "utf8",
  );

  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expectedBuffer,
    receivedBuffer,
  );
}

function createSecretFingerprint(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  return createHash("sha256")
    .update(value, "utf8")
    .digest("hex")
    .slice(0, 12);
}

export function authorizeAutomationRequest(
  request: NextRequest,
): AutomationAuthorizationResult {
  const configuredSecret =
    getConfiguredSecret();

  const receivedSecret =
    getReceivedSecret(request);

  const authorized = Boolean(
    configuredSecret &&
      receivedSecret.secret &&
      secureSecretEquals(
        configuredSecret.secret,
        receivedSecret.secret,
      ),
  );

  return {
    configured: configuredSecret !== null,
    authorized,
    diagnostics: {
      configured: configuredSecret !== null,
      configuredSource:
        configuredSecret?.source ?? null,
      expectedLength:
        configuredSecret?.secret.length ?? 0,
      expectedFingerprint:
        createSecretFingerprint(
          configuredSecret?.secret ?? null,
        ),
      received:
        receivedSecret.secret !== null,
      receivedSource: receivedSecret.source,
      receivedLength:
        receivedSecret.secret?.length ?? 0,
      receivedFingerprint:
        createSecretFingerprint(
          receivedSecret.secret,
        ),
    },
  };
}