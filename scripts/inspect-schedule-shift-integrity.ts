import "dotenv/config";
import {
  writeFile,
} from "node:fs/promises";

const {
  prisma,
} = await import(
  "../src/lib/db/prisma"
);

type CountRow = {
  countValue: bigint | number;
};

async function main(): Promise<void> {
  const shiftDependencies =
    await prisma.$queryRaw<
      Record<string, unknown>[]
    >`
      SELECT
        sh.shift_id AS shiftId,
        sh.shift_code AS shiftCode,
        sh.name,
        sh.status,
        COUNT(DISTINCT ss.schedule_id) AS scheduleCount,
        COUNT(DISTINCT a.attendance_id) AS attendanceCount
      FROM shifts sh
      LEFT JOIN shift_schedules ss
        ON ss.shift_id = sh.shift_id
      LEFT JOIN attendance a
        ON a.schedule_id = ss.schedule_id
      GROUP BY
        sh.shift_id,
        sh.shift_code,
        sh.name,
        sh.status
      ORDER BY sh.shift_id
    `;

  const scheduleDependencies =
    await prisma.$queryRaw<
      Record<string, unknown>[]
    >`
      SELECT
        ss.schedule_id AS scheduleId,
        ss.schedule_code AS scheduleCode,
        ss.name,
        ss.status,
        ss.days_of_week AS daysOfWeek,
        ss.effective_from AS effectiveFrom,
        ss.effective_to AS effectiveTo,
        sh.shift_code AS shiftCode,
        sh.status AS shiftStatus,

        (
          SELECT COUNT(*)
          FROM employees e
          WHERE e.schedule_id = ss.schedule_id
        ) AS currentEmployeeCount,

        (
          SELECT COUNT(*)
          FROM employee_schedule_assignments esa
          WHERE esa.schedule_id = ss.schedule_id
        ) AS assignmentHistoryCount,

        (
          SELECT COUNT(*)
          FROM employee_schedule_assignments esa
          WHERE
            esa.schedule_id = ss.schedule_id
            AND esa.is_active = 1
        ) AS activeAssignmentCount,

        (
          SELECT COUNT(*)
          FROM attendance a
          WHERE a.schedule_id = ss.schedule_id
        ) AS attendanceCount

      FROM shift_schedules ss
      INNER JOIN shifts sh
        ON sh.shift_id = ss.shift_id
      ORDER BY ss.schedule_id
    `;

  const duplicateActiveAssignments =
    await prisma.$queryRaw<
      Record<string, unknown>[]
    >`
      SELECT
        emp_id AS empId,
        COUNT(*) AS activeAssignmentCount
      FROM employee_schedule_assignments
      WHERE is_active = 1
      GROUP BY emp_id
      HAVING COUNT(*) > 1
      ORDER BY emp_id
    `;

  const currentScheduleWithoutActiveHistory =
    await prisma.$queryRaw<
      Record<string, unknown>[]
    >`
      SELECT
        e.emp_id AS empId,
        e.emp_number AS empNumber,
        e.schedule_id AS currentScheduleId
      FROM employees e
      LEFT JOIN employee_schedule_assignments esa
        ON esa.emp_id = e.emp_id
        AND esa.is_active = 1
      WHERE
        e.schedule_id IS NOT NULL
        AND esa.assignment_id IS NULL
      ORDER BY e.emp_id
      LIMIT 100
    `;

  const activeHistoryMismatch =
    await prisma.$queryRaw<
      Record<string, unknown>[]
    >`
      SELECT
        e.emp_id AS empId,
        e.emp_number AS empNumber,
        e.schedule_id AS employeeScheduleId,
        esa.schedule_id AS activeHistoryScheduleId
      FROM employees e
      INNER JOIN employee_schedule_assignments esa
        ON esa.emp_id = e.emp_id
        AND esa.is_active = 1
      WHERE
        e.schedule_id IS NULL
        OR e.schedule_id <> esa.schedule_id
      ORDER BY e.emp_id
      LIMIT 100
    `;

  const overlappingAssignmentDates =
    await prisma.$queryRaw<
      Record<string, unknown>[]
    >`
      SELECT
        older.emp_id AS empId,
        older.assignment_id AS firstAssignmentId,
        newer.assignment_id AS secondAssignmentId,
        older.valid_from AS firstValidFrom,
        older.valid_to AS firstValidTo,
        newer.valid_from AS secondValidFrom,
        newer.valid_to AS secondValidTo
      FROM employee_schedule_assignments older
      INNER JOIN employee_schedule_assignments newer
        ON newer.emp_id = older.emp_id
        AND newer.assignment_id > older.assignment_id
        AND older.valid_from <= COALESCE(
          newer.valid_to,
          '9999-12-31'
        )
        AND newer.valid_from <= COALESCE(
          older.valid_to,
          '9999-12-31'
        )
      ORDER BY
        older.emp_id,
        older.assignment_id,
        newer.assignment_id
    `;

  const invalidScheduleDates =
    await prisma.$queryRaw<
      Record<string, unknown>[]
    >`
      SELECT
        schedule_id AS scheduleId,
        schedule_code AS scheduleCode,
        effective_from AS effectiveFrom,
        effective_to AS effectiveTo
      FROM shift_schedules
      WHERE
        effective_to IS NOT NULL
        AND effective_to < effective_from
      ORDER BY schedule_id
    `;

  const countRows =
    await prisma.$queryRaw<
      CountRow[]
    >`
      SELECT COUNT(*) AS countValue
      FROM employees
      WHERE schedule_id IS NOT NULL
    `;

  const report = {
    generatedAt:
      new Date().toISOString(),

    employeesWithCurrentSchedule:
      Number(
        countRows[0]
          ?.countValue ?? 0,
      ),

    shiftDependencies,
    scheduleDependencies,
    duplicateActiveAssignments,
    currentScheduleWithoutActiveHistory,
    activeHistoryMismatch,
    overlappingAssignmentDates,
    invalidScheduleDates,
  };

  await writeFile(
    "schedule-shift-integrity-inspection.json",
    JSON.stringify(
      report,
      (
        _key,
        value,
      ) =>
        typeof value === "bigint"
          ? Number(value)
          : value,
      2,
    ),
    "utf8",
  );

  console.log(
    "Created: schedule-shift-integrity-inspection.json",
  );
}

try {
  await main();
} catch (error: unknown) {
  console.error(
    "Schedule and shift integrity inspection failed:",
    error,
  );

  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}