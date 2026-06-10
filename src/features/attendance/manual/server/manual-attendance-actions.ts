"use server";

import type {
  Prisma,
} from "@/generated/prisma/client";
import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  getAttendanceEnforcementPolicy,
  getAttendanceSourceDisabledMessage,
  isAttendanceSourceAllowed,
  resolveAttendanceBranchId,
} from "@/features/attendance/policies/server/attendance-policy-enforcement";
import { manualAttendanceValidationSchema } from "../validators/manual-attendance-validation";
import type { ManualAttendanceActionState } from "../types/manual-attendance-types";

function formDataToObject(
  formData: FormData,
): Record<
  string,
  FormDataEntryValue
> {
  return Object.fromEntries(
    formData.entries(),
  );
}

function parseManilaDateOnly(
  value: string,
): Date {
  const [
    year = "1970",
    month = "01",
    day = "01",
  ] = value.split("-");

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      0,
      0,
      0,
      0,
    ),
  );
}

function parseManilaDateTimeLocal(
  value: string,
): Date {
  const [
    datePart =
      "1970-01-01",
    timePart =
      "00:00",
  ] = value.split("T");

  const [
    year = "1970",
    month = "01",
    day = "01",
  ] = datePart.split("-");

  const [
    hour = "00",
    minute = "00",
  ] = timePart.split(":");

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - 8,
      Number(minute),
      0,
      0,
    ),
  );
}

function calculateTotalMinutes(
  timeIn: Date,
  timeOut: Date | null,
): number | null {
  if (!timeOut) {
    return null;
  }

  const difference =
    Math.floor(
      (
        timeOut.getTime() -
        timeIn.getTime()
      ) / 60_000,
    );

  if (
    difference < 0
  ) {
    return null;
  }

  return difference;
}

function buildAttendanceAuditValue(input: {
  attendanceId: number;
  empId: number;
  scheduleId: number | null;
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  status: string;
  totalMinutes: number | null;
  isManual: boolean;
  inSource: string | null;
  outSource: string | null;
  verifiedById: number | null;
  verifiedAt: Date | null;
  approvedById: number | null;
  approvedAt: Date | null;
}): Prisma.InputJsonObject {
  return {
    attendanceId:
      input.attendanceId,

    empId:
      input.empId,

    scheduleId:
      input.scheduleId,

    attDate:
      input.attDate.toISOString(),

    timeIn:
      input.timeIn
        ?.toISOString() ??
      null,

    timeOut:
      input.timeOut
        ?.toISOString() ??
      null,

    status:
      input.status,

    totalMinutes:
      input.totalMinutes,

    isManual:
      input.isManual,

    inSource:
      input.inSource,

    outSource:
      input.outSource,

    verifiedById:
      input.verifiedById,

    verifiedAt:
      input.verifiedAt
        ?.toISOString() ??
      null,

    approvedById:
      input.approvedById,

    approvedAt:
      input.approvedAt
        ?.toISOString() ??
      null,
  };
}

const attendanceAuditSelect = {
  attendanceId: true,
  empId: true,
  scheduleId: true,
  attDate: true,
  timeIn: true,
  timeOut: true,
  status: true,
  totalMinutes: true,
  isManual: true,
  inSource: true,
  outSource: true,
  verifiedById: true,
  verifiedAt: true,
  approvedById: true,
  approvedAt: true,
} satisfies Prisma.AttendanceSelect;

export async function saveManualAttendanceAction(
  _previousState:
    ManualAttendanceActionState,

  formData: FormData,
): Promise<ManualAttendanceActionState> {
  const session =
    await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (
    !canManageEmployees(
      session.role,
    )
  ) {
    return {
      ok: false,

      message:
        "You do not have permission to create manual attendance.",
    };
  }

  const policy =
    await getAttendanceEnforcementPolicy();

  if (
    !isAttendanceSourceAllowed({
      source: "MANUAL",
      policy,
    })
  ) {
    return {
      ok: false,

      message:
        getAttendanceSourceDisabledMessage(
          "MANUAL",
        ),
    };
  }

  const parsed =
    manualAttendanceValidationSchema.safeParse(
      formDataToObject(
        formData,
      ),
    );

  if (!parsed.success) {
    return {
      ok: false,

      message:
        "Please review the highlighted fields.",

      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const data =
    parsed.data;

  const attDate =
    parseManilaDateOnly(
      data.attDate,
    );

  const timeIn =
    parseManilaDateTimeLocal(
      data.timeIn,
    );

  const timeOut =
    data.timeOut
      ? parseManilaDateTimeLocal(
          data.timeOut,
        )
      : null;

  const totalMinutes =
    calculateTotalMinutes(
      timeIn,
      timeOut,
    );

  const now =
    new Date();

  const employee =
    await prisma.employee.findFirst({
      where: {
        empId:
          data.empId,

        status:
          "ACTIVE",
      },

      select: {
        empId: true,
        branchId: true,
        scheduleId: true,

        schedule: {
          select: {
            scheduleId: true,
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
    });

  if (!employee) {
    return {
      ok: false,

      message:
        "Selected employee is inactive or does not exist.",

      fieldErrors: {
        empId: [
          "Selected employee is inactive or does not exist.",
        ],
      },
    };
  }

  const branchId =
    resolveAttendanceBranchId({
      employeeBranchId:
        employee.branchId,

      defaultBranchId:
        policy.defaultBranchId,
    });

  if (!branchId) {
    return {
      ok: false,

      message:
        "No active attendance branch could be resolved for the selected employee.",

      fieldErrors: {
        empId: [
          "The selected employee does not have a valid attendance branch.",
        ],
      },
    };
  }

  const activeSchedule =
    employee.schedule &&
    employee.schedule.status ===
      "ACTIVE" &&
    employee.schedule.shift
      .status === "ACTIVE" &&
    employee.schedule
      .effectiveFrom <=
      attDate &&
    (
      !employee.schedule
        .effectiveTo ||
      employee.schedule
        .effectiveTo >=
        attDate
    )
      ? employee.schedule
      : null;

  const existingAttendance =
    await prisma.attendance.findUnique({
      where: {
        empId_attDate: {
          empId:
            employee.empId,

          attDate,
        },
      },

      select:
        attendanceAuditSelect,
    });

  const savedAttendance =
    await prisma.$transaction(
      async (tx) => {
        if (
          existingAttendance
        ) {
          const updatedAttendance =
            await tx.attendance.update({
              where: {
                attendanceId:
                  existingAttendance.attendanceId,
              },

              data: {
                scheduleId:
                  activeSchedule
                    ?.scheduleId ??
                  employee.scheduleId ??
                  null,

                timeIn,
                timeOut,

                inRemark:
                  data.remarks,

                outRemark:
                  timeOut
                    ? data.remarks
                    : null,

                inReason:
                  data.reason,

                outReason:
                  timeOut
                    ? data.reason
                    : null,

                inSource:
                  "MANUAL",

                outSource:
                  timeOut
                    ? "MANUAL"
                    : null,

                inBranchId:
                  branchId,

                outBranchId:
                  timeOut
                    ? branchId
                    : null,

                inAddress:
                  data.address,

                outAddress:
                  timeOut
                    ? data.address
                    : null,

                status:
                  "PENDING_REVIEW",

                totalMinutes,

                isSynced:
                  true,

                isManual:
                  true,

                verifiedById:
                  null,

                verifiedAt:
                  null,

                approvedById:
                  null,

                approvedAt:
                  null,

                updatedById:
                  session.userId,
              },

              select:
                attendanceAuditSelect,
            });

          await tx.attendanceLog.create({
            data: {
              attendanceId:
                updatedAttendance.attendanceId,

              empId:
                employee.empId,

              punchType:
                "CORRECTION",

              punchedAt:
                now,

              source:
                "MANUAL",

              branchId,

              address:
                data.address,

              remarks:
                data.remarks,

              reason:
                data.reason,
            },
          });

          await tx.activityLog.create({
            data: {
              actorUserId:
                session.userId,

              action:
                "MANUAL_ATTENDANCE_CORRECTED",

              entityType:
                "attendance",

              entityId:
                String(
                  updatedAttendance.attendanceId,
                ),

              oldValue:
                buildAttendanceAuditValue(
                  existingAttendance,
                ),

              newValue:
                buildAttendanceAuditValue(
                  updatedAttendance,
                ),
            },
          });

          return updatedAttendance;
        }

        const createdAttendance =
          await tx.attendance.create({
            data: {
              empId:
                employee.empId,

              scheduleId:
                activeSchedule
                  ?.scheduleId ??
                employee.scheduleId ??
                null,

              attDate,

              timeIn,
              timeOut,

              inRemark:
                data.remarks,

              outRemark:
                timeOut
                  ? data.remarks
                  : null,

              inReason:
                data.reason,

              outReason:
                timeOut
                  ? data.reason
                  : null,

              inSource:
                "MANUAL",

              outSource:
                timeOut
                  ? "MANUAL"
                  : null,

              inBranchId:
                branchId,

              outBranchId:
                timeOut
                  ? branchId
                  : null,

              inAddress:
                data.address,

              outAddress:
                timeOut
                  ? data.address
                  : null,

              status:
                "PENDING_REVIEW",

              totalMinutes,

              isSynced:
                true,

              isManual:
                true,

              createdById:
                session.userId,

              updatedById:
                session.userId,
            },

            select:
              attendanceAuditSelect,
          });

        await tx.attendanceLog.create({
          data: {
            attendanceId:
              createdAttendance.attendanceId,

            empId:
              employee.empId,

            punchType:
              "MANUAL_EDIT",

            punchedAt:
              now,

            source:
              "MANUAL",

            branchId,

            address:
              data.address,

            remarks:
              data.remarks,

            reason:
              data.reason,
          },
        });

        await tx.activityLog.create({
          data: {
            actorUserId:
              session.userId,

            action:
              "MANUAL_ATTENDANCE_CREATED",

            entityType:
              "attendance",

            entityId:
              String(
                createdAttendance.attendanceId,
              ),

            newValue:
              buildAttendanceAuditValue(
                createdAttendance,
              ),
          },
        });

        return createdAttendance;
      },
    );

  revalidatePath(
    "/dashboard/attendance",
  );

  revalidatePath(
    "/dashboard/attendance/reports",
  );

  revalidatePath(
    `/dashboard/attendance/${savedAttendance.attendanceId}`,
  );

  revalidatePath(
    `/dashboard/employees/${employee.empId}`,
  );

  redirect(
    `/dashboard/attendance/${savedAttendance.attendanceId}`,
  );
}