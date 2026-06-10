import {
  loadProjectEnvironment,
} from "./load-project-env";

loadProjectEnvironment();

const {
  prisma,
} = await import(
  "../src/lib/db/prisma"
);

async function main(): Promise<void> {
  const record =
    await prisma.activityLog.findFirst({
      where: {
        action:
          "ATTENDANCE_POLICY_UPDATED_V1",

        entityType:
          "attendance_policy",

        entityId:
          "GLOBAL",
      },

      orderBy: {
        activityLogId:
          "desc",
      },

      select: {
        activityLogId: true,
        actorUserId: true,
        action: true,
        entityType: true,
        entityId: true,
        oldValue: true,
        newValue: true,
        createdAt: true,
      },
    });

  if (!record) {
    console.error(
      "No Attendance Policy update audit record was found.",
    );

    console.error(
      "Save the Attendance Policies form in the browser, then run this script again.",
    );

    process.exitCode = 1;

    return;
  }

  console.log(
    "Latest Attendance Policy audit record:",
  );

  console.log({
    activityLogId:
      record.activityLogId,

    actorUserId:
      record.actorUserId,

    action:
      record.action,

    entityType:
      record.entityType,

    entityId:
      record.entityId,

    createdAt:
      record.createdAt.toISOString(),
  });

  console.log(
    "Old value:",
  );

  console.log(
    JSON.stringify(
      record.oldValue,
      null,
      2,
    ),
  );

  console.log(
    "New value:",
  );

  console.log(
    JSON.stringify(
      record.newValue,
      null,
      2,
    ),
  );

  if (record.actorUserId === null) {
    console.error(
      "Audit verification failed: actorUserId is null.",
    );

    process.exitCode = 1;

    return;
  }

  if (
    !Number.isSafeInteger(
      record.actorUserId,
    ) ||
    record.actorUserId <= 0
  ) {
    console.error(
      "Audit verification failed: actorUserId is not a positive integer.",
    );

    process.exitCode = 1;

    return;
  }

  console.log(
    "Attendance Policy audit verification passed.",
  );
}

try {
  await main();
} catch (error: unknown) {
  console.error(
    "Attendance Policy audit verification failed:",
    error,
  );

  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}