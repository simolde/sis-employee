import {
  loadProjectEnvironment,
} from "./load-project-env";

loadProjectEnvironment();

const {
  prisma,
} = await import(
  "../src/lib/db/prisma"
);

const APPLY_CHANGES =
  process.argv.includes(
    "--apply",
  );

type RepairCandidate = {
  empId: number;
  empNumber: string;
  scheduleId: number;
  scheduleCode: string;
  validFrom: Date;
  source: string;
};

function toDateOnly(
  date: Date,
): Date {
  return new Date(
    `${date
      .toISOString()
      .slice(
        0,
        10,
      )}T00:00:00.000Z`,
  );
}

function laterDate(
  first: Date,
  second: Date,
): Date {
  return first >
    second
    ? first
    : second;
}

async function getRepairActor() {
  const actorEmail =
    (
      process.env
        .SCHEDULE_HISTORY_REPAIR_ACTOR_EMAIL ??
      process.env
        .SEED_ADMIN_EMAIL ??
      ""
    ).trim();

  if (!actorEmail) {
    throw new Error(
      "Set SCHEDULE_HISTORY_REPAIR_ACTOR_EMAIL or SEED_ADMIN_EMAIL to an existing administrator.",
    );
  }

  const actor =
    await prisma.user.findUnique({
      where: {
        email:
          actorEmail,
      },

      select: {
        userId: true,
        username: true,
        email: true,
        status: true,
      },
    });

  if (
    !actor ||
    actor.status !==
      "ACTIVE"
  ) {
    throw new Error(
      `An active repair actor was not found for ${actorEmail}.`,
    );
  }

  return actor;
}

async function getCandidates(): Promise<RepairCandidate[]> {
  const employees =
    await prisma.employee.findMany({
      where: {
        scheduleId: {
          not: null,
        },

        employeeScheduleAssignments: {
          none: {
            isActive:
              true,
          },
        },
      },

      select: {
        empId: true,
        empNumber: true,
        scheduleId: true,
        dateHired: true,
        createdAt: true,

        schedule: {
          select: {
            scheduleId: true,
            scheduleCode: true,
            status: true,
            effectiveFrom: true,
            effectiveTo: true,

            shift: {
              select: {
                status: true,
              },
            },
          },
        },
      },

      orderBy: {
        empId: "asc",
      },
    });

  const candidates:
    RepairCandidate[] =
    [];

  for (
    const employee of
    employees
  ) {
    const schedule =
      employee.schedule;

    if (
      !employee.scheduleId ||
      !schedule ||
      schedule.status !==
        "ACTIVE" ||
      schedule.shift.status !==
        "ACTIVE"
    ) {
      continue;
    }

    const earliestAttendance =
      await prisma.attendance.findFirst({
        where: {
          empId:
            employee.empId,

          scheduleId:
            schedule.scheduleId,
        },

        select: {
          attDate: true,
        },

        orderBy: {
          attDate: "asc",
        },
      });

    let evidenceDate:
      Date;

    let source:
      string;

    if (
      earliestAttendance
    ) {
      evidenceDate =
        earliestAttendance.attDate;

      source =
        "EARLIEST_ATTENDANCE";
    } else if (
      employee.dateHired
    ) {
      evidenceDate =
        employee.dateHired;

      source =
        "EMPLOYEE_DATE_HIRED";
    } else {
      evidenceDate =
        employee.createdAt;

      source =
        "EMPLOYEE_CREATED_AT";
    }

    const validFrom =
      laterDate(
        toDateOnly(
          schedule.effectiveFrom,
        ),

        toDateOnly(
          evidenceDate,
        ),
      );

    if (
      schedule.effectiveTo &&
      validFrom >
        schedule.effectiveTo
    ) {
      continue;
    }

    candidates.push({
      empId:
        employee.empId,

      empNumber:
        employee.empNumber,

      scheduleId:
        schedule.scheduleId,

      scheduleCode:
        schedule.scheduleCode,

      validFrom,

      source,
    });
  }

  return candidates;
}

async function applyRepair(
  candidate:
    RepairCandidate,

  actorUserId: number,
): Promise<boolean> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw<
        Array<{
          empId: number;
        }>
      >`
        SELECT
          emp_id AS empId
        FROM employees
        WHERE emp_id = ${candidate.empId}
        FOR UPDATE
      `;

      const employee =
        await tx.employee.findUnique({
          where: {
            empId:
              candidate.empId,
          },

          select: {
            empId: true,
            empNumber: true,
            scheduleId: true,

            employeeScheduleAssignments: {
              where: {
                isActive:
                  true,
              },

              select: {
                assignmentId:
                  true,
              },
            },
          },
        });

      if (
        !employee ||
        employee.scheduleId !==
          candidate.scheduleId ||
        employee
          .employeeScheduleAssignments
          .length >
          0
      ) {
        return false;
      }

      const assignment =
        await tx.employeeScheduleAssignment.create({
          data: {
            empId:
              candidate.empId,

            scheduleId:
              candidate.scheduleId,

            validFrom:
              candidate.validFrom,

            validTo:
              null,

            isActive:
              true,

            assignedById:
              actorUserId,

            remarks:
              `Backfilled from employees.schedule_id using ${candidate.source}.`,
          },

          select: {
            assignmentId:
              true,
          },
        });

      await tx.activityLog.create({
        data: {
          actorUserId,

          action:
            "EMPLOYEE_SCHEDULE_HISTORY_BACKFILLED_V1",

          entityType:
            "employee",

          entityId:
            String(
              candidate.empId,
            ),

          oldValue: {
            empId:
              candidate.empId,

            empNumber:
              candidate.empNumber,

            scheduleId:
              candidate.scheduleId,

            activeAssignment:
              null,
          },

          newValue: {
            empId:
              candidate.empId,

            empNumber:
              candidate.empNumber,

            scheduleId:
              candidate.scheduleId,

            scheduleCode:
              candidate.scheduleCode,

            assignmentId:
              assignment.assignmentId,

            validFrom:
              candidate.validFrom.toISOString(),

            validTo:
              null,

            isActive:
              true,

            evidenceSource:
              candidate.source,
          },
        },
      });

      return true;
    },
  );
}

async function main(): Promise<void> {
  const actor =
    await getRepairActor();

  const candidates =
    await getCandidates();

  console.log(
    APPLY_CHANGES
      ? "Schedule history repair mode: APPLY"
      : "Schedule history repair mode: DRY RUN",
  );

  console.log(
    `Repair actor: ${actor.username} <${actor.email}>`,
  );

  console.log(
    `Candidates: ${candidates.length}`,
  );

  console.table(
    candidates.map(
      (candidate) => ({
        employee:
          candidate.empNumber,

        schedule:
          candidate.scheduleCode,

        validFrom:
          candidate.validFrom
            .toISOString()
            .slice(
              0,
              10,
            ),

        source:
          candidate.source,
      }),
    ),
  );

  if (!APPLY_CHANGES) {
    console.log(
      "No records were changed. Run again with --apply after reviewing the candidates.",
    );

    return;
  }

  let repairedCount =
    0;

  let skippedCount =
    0;

  for (
    const candidate of
    candidates
  ) {
    const repaired =
      await applyRepair(
        candidate,
        actor.userId,
      );

    if (repaired) {
      repairedCount +=
        1;
    } else {
      skippedCount +=
        1;
    }
  }

  console.log({
    repairedCount,
    skippedCount,
  });

  if (
    skippedCount >
    0
  ) {
    console.warn(
      "Some rows changed after inspection and were safely skipped.",
    );
  }

  console.log(
    "Schedule assignment history repair completed.",
  );
}

try {
  await main();
} catch (error: unknown) {
  console.error(
    "Schedule assignment history repair failed:",
    error,
  );

  process.exitCode =
    1;
} finally {
  await prisma.$disconnect();
}