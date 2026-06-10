import {
  loadProjectEnvironment,
} from "./load-project-env";

loadProjectEnvironment();

const {
  prisma,
} = await import(
  "../src/lib/db/prisma"
);

type AttendancePolicyVerificationRow = {
  settingKey: string;
  settingValue: string;
  valueType: string;
  description: string | null;
};

const EXPECTED_KEYS = [
  "DEFAULT_BRANCH_ID",
  "ALLOW_WEB_TIME_IN",
  "ALLOW_MANUAL_TIME_IN",
  "REQUIRE_PHOTO",
  "REQUIRE_LOCATION",
  "PHOTO_DIRECTORY",
  "MAX_PHOTO_SIZE_MB",
  "LATE_GRACE_MINUTES",
  "AUTO_MARK_MISSING_TIMEOUT",
  "MISSING_TIMEOUT_MINUTES",
] as const;

type ExpectedAttendancePolicyKey =
  (typeof EXPECTED_KEYS)[number];

function isExpectedKey(
  key: string,
): key is ExpectedAttendancePolicyKey {
  return EXPECTED_KEYS.some(
    (expectedKey) =>
      expectedKey === key,
  );
}

async function main(): Promise<void> {
  const rows =
    await prisma.$queryRaw<
      AttendancePolicyVerificationRow[]
    >`
      SELECT
        setting_key AS settingKey,
        setting_value AS settingValue,
        value_type AS valueType,
        description
      FROM attendance_policy_settings
      ORDER BY setting_key ASC
    `;

  const existingKeys =
    new Set(
      rows.map(
        (row) =>
          row.settingKey,
      ),
    );

  const missingKeys =
    EXPECTED_KEYS.filter(
      (key) =>
        !existingKeys.has(key),
    );

  const unexpectedKeys =
    rows
      .map(
        (row) =>
          row.settingKey,
      )
      .filter(
        (key) =>
          !isExpectedKey(key),
      );

  console.log(
    `Attendance Policy row count: ${rows.length}`,
  );

  console.table(
    rows.map(
      (row) => ({
        key:
          row.settingKey,

        value:
          row.settingValue,

        type:
          row.valueType,

        description:
          row.description ?? "",
      }),
    ),
  );

  if (missingKeys.length > 0) {
    console.error(
      "Missing required policy keys:",
      missingKeys,
    );

    process.exitCode = 1;
  }

  if (unexpectedKeys.length > 0) {
    console.warn(
      "Unexpected policy keys found:",
      unexpectedKeys,
    );
  }

  if (
    rows.length !==
    EXPECTED_KEYS.length
  ) {
    console.error(
      [
        "Attendance Policy row-count verification failed.",
        `Expected ${EXPECTED_KEYS.length} rows but found ${rows.length}.`,
      ].join(" "),
    );

    process.exitCode = 1;

    return;
  }

  if (missingKeys.length > 0) {
    return;
  }

  console.log(
    "Attendance Policy storage verification passed.",
  );
}

try {
  await main();
} catch (error: unknown) {
  console.error(
    "Attendance Policy storage verification failed:",
    error,
  );

  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}