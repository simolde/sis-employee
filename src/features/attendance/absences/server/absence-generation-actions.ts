"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import type { AbsenceGenerationActionState } from "../types/absence-generation-types";

type AbsenceGenerationFilters = {
  date: string;
  q: string;
  branchId: string;
  departmentId: string;
  scheduleId: string;
  activeOnly: boolean;
};

type AbsenceGenerationEmployee = {
  empId: number;
  empNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  status: string;
  branchId: number;
  departmentId: number | null;
  scheduleId: number | null;
  schedule: {
    scheduleId: number;
    scheduleCode: string;
    name: string;
    daysOfWeek: string | null;
    shift: {
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  } | null;
};

const weekdayTokens = [
  {
    index: 0,
    short: "SUN",
    long: "SUNDAY",
    numberTokens: ["0", "7"],
  },
  {
    index: 1,
    short: "MON",
    long: "MONDAY",
    numberTokens: ["1"],
  },
  {
    index: 2,
    short: "TUE",
    long: "TUESDAY",
    numberTokens: ["2"],
  },
  {
    index: 3,
    short: "WED",
    long: "WEDNESDAY",
    numberTokens: ["3"],
  },
  {
    index: 4,
    short: "THU",
    long: "THURSDAY",
    numberTokens: ["4"],
  },
  {
    index: 5,
    short: "FRI",
    long: "FRIDAY",
    numberTokens: ["5"],
  },
  {
    index: 6,
    short: "SAT",
    long: "SATURDAY",
    numberTokens: ["6"],
  },
];

function formDataString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseLimit(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") {
    return 500;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 500;
  }

  return Math.min(parsed, 500);
}

function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getDateRange(date: Date): {
  start: Date;
  end: Date;
} {
  const end = new Date(date);

  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start: date,
    end,
  };
}

function parseFilters(formData: FormData): AbsenceGenerationFilters {
  return {
    date: formDataString(formData, "date"),
    q: formDataString(formData, "q"),
    branchId: formDataString(formData, "branchId"),
    departmentId: formDataString(formData, "departmentId"),
    scheduleId: formDataString(formData, "scheduleId"),
    activeOnly: formDataString(formData, "activeOnly") !== "false",
  };
}

function isScheduleApplicableOnDate(input: {
  date: Date;
  daysOfWeek: string | null;
}): boolean {
  if (!input.daysOfWeek?.trim()) {
    return true;
  }

  const dayIndex = input.date.getUTCDay();
  const day = weekdayTokens.find((item) => item.index === dayIndex);

  if (!day) {
    return false;
  }

  const tokens = input.daysOfWeek
    .toUpperCase()
    .split(/[\s,;/|]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.some(
    (token) =>
      token === day.short ||
      token === day.long ||
      day.numberTokens.includes(token),
  );
}

function buildEmployeeWhere(input: {
  filters: AbsenceGenerationFilters;
  attDate: Date;
}): Prisma.EmployeeWhereInput {
  const andConditions: Prisma.EmployeeWhereInput[] = [
    {
      scheduleId: {
        not: null,
      },
    },
  ];

  const branchId = parsePositiveId(input.filters.branchId);
  const departmentId = parsePositiveId(input.filters.departmentId);
  const scheduleId = parsePositiveId(input.filters.scheduleId);
  const dateRange = getDateRange(input.attDate);

  if (input.filters.activeOnly) {
    andConditions.push({
      status: "ACTIVE",
    });
  }

  if (branchId) {
    andConditions.push({
      branchId,
    });
  }

  if (departmentId) {
    andConditions.push({
      departmentId,
    });
  }

  if (scheduleId) {
    andConditions.push({
      scheduleId,
    });
  }

  if (input.filters.q) {
    andConditions.push({
      OR: [
        {
          empNumber: {
            contains: input.filters.q,
          },
        },
        {
          firstName: {
            contains: input.filters.q,
          },
        },
        {
          middleName: {
            contains: input.filters.q,
          },
        },
        {
          lastName: {
            contains: input.filters.q,
          },
        },
        {
          branch: {
            name: {
              contains: input.filters.q,
            },
          },
        },
        {
          department: {
            name: {
              contains: input.filters.q,
            },
          },
        },
        {
          schedule: {
            scheduleCode: {
              contains: input.filters.q,
            },
          },
        },
        {
          schedule: {
            name: {
              contains: input.filters.q,
            },
          },
        },
      ],
    });
  }

  andConditions.push({
    attendanceRecords: {
      none: {
        attDate: {
          gte: dateRange.start,
          lt: dateRange.end,
        },
      },
    },
  });

  return {
    AND: andConditions,
  };
}

function buildAbsenceAuditValue(input: {
  attendanceId: number;
  employee: AbsenceGenerationEmployee;
  attDate: Date;
  actorUserId: number;
}): Prisma.InputJsonObject {
  return {
    attendanceId: input.attendanceId,
    empId: input.employee.empId,
    empNumber: input.employee.empNumber,
    scheduleId: input.employee.scheduleId,
    scheduleName: input.employee.schedule
      ? `${input.employee.schedule.scheduleCode} · ${input.employee.schedule.name}`
      : null,
    attDate: input.attDate.toISOString(),
    status: "ABSENT",
    timeIn: null,
    timeOut: null,
    totalMinutes: null,
    isManual: false,
    generatedById: input.actorUserId,
    generationSource: "ABSENCE_CANDIDATES",
  };
}

function revalidateAbsencePages() {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/actions");
  revalidatePath("/dashboard/attendance/absences/candidates");
  revalidatePath("/dashboard/attendance/reports");
  revalidatePath("/dashboard/attendance/audit");
}

export async function generateAbsentRecordsAction(
  _previousState: AbsenceGenerationActionState,
  formData: FormData,
): Promise<AbsenceGenerationActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to generate ABSENT records.",
    };
  }

  const filters = parseFilters(formData);
  const attDate = parseDateInput(filters.date);
  const limit = parseLimit(formData.get("limit"));
  const confirmGenerate = formData.get("confirmGenerate") === "on";

  if (!attDate) {
    return {
      ok: false,
      message: "Please select a valid attendance date.",
      fieldErrors: {
        date: ["A valid attendance date is required."],
      },
    };
  }

  if (!confirmGenerate) {
    return {
      ok: false,
      message:
        "Please confirm that you already reviewed leave, holiday, suspension, and rest day exceptions.",
      fieldErrors: {
        confirmGenerate: ["Confirmation is required before generating ABSENT."],
      },
    };
  }

  const where = buildEmployeeWhere({
    filters,
    attDate,
  });

  const result = await prisma.$transaction(async (tx) => {
    const employees = await tx.employee.findMany({
      where,
      select: {
        empId: true,
        empNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        status: true,
        branchId: true,
        departmentId: true,
        scheduleId: true,
        schedule: {
          select: {
            scheduleId: true,
            scheduleCode: true,
            name: true,
            daysOfWeek: true,
            shift: {
              select: {
                startTime: true,
                endTime: true,
                isOvernight: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
        {
          empId: "asc",
        },
      ],
      take: limit * 3,
    });

    const candidates = employees
      .filter(
        (employee) =>
          employee.scheduleId &&
          employee.schedule &&
          isScheduleApplicableOnDate({
            date: attDate,
            daysOfWeek: employee.schedule.daysOfWeek,
          }),
      )
      .slice(0, limit);

    let generatedCount = 0;
    let skippedCount = 0;

    const dateRange = getDateRange(attDate);

    for (const employee of candidates) {
      if (!employee.scheduleId) {
        skippedCount += 1;
        continue;
      }

      const existingAttendance = await tx.attendance.findFirst({
        where: {
          empId: employee.empId,
          attDate: {
            gte: dateRange.start,
            lt: dateRange.end,
          },
        },
        select: {
          attendanceId: true,
        },
      });

      if (existingAttendance) {
        skippedCount += 1;
        continue;
      }

      const attendance = await tx.attendance.create({
        data: {
          empId: employee.empId,
          scheduleId: employee.scheduleId,
          attDate,
          timeIn: null,
          timeOut: null,
          status: "ABSENT",
          totalMinutes: null,
          isManual: false,
          updatedById: session.userId,
        },
        select: {
          attendanceId: true,
        },
      });

      await tx.activityLog.create({
        data: {
          actorUserId: session.userId,
          action: "ATTENDANCE_ABSENT_AUTO_GENERATED",
          entityType: "attendance",
          entityId: String(attendance.attendanceId),
          oldValue: {
            attendanceExisted: false,
          },
          newValue: buildAbsenceAuditValue({
            attendanceId: attendance.attendanceId,
            employee,
            attDate,
            actorUserId: session.userId,
          }),
        },
      });

      generatedCount += 1;
    }

    return {
      checkedCount: candidates.length,
      generatedCount,
      skippedCount,
    };
  });

  revalidateAbsencePages();

  return {
    ok: true,
    checkedCount: result.checkedCount,
    generatedCount: result.generatedCount,
    skippedCount: result.skippedCount,
    message:
      result.generatedCount > 0
        ? `${result.generatedCount} ABSENT record(s) generated. ${result.skippedCount} candidate(s) skipped.`
        : `No ABSENT records generated. ${result.checkedCount} candidate(s) checked.`,
  };
}