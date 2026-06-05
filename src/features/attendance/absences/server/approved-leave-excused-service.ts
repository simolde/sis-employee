import type { Prisma } from "@/generated/prisma/client";

export type ApprovedLeaveExcusedGenerationSource =
  | "APPROVED_LEAVE"
  | "APPROVED_LEAVE_SYNC"
  | "APPROVED_LEAVE_AUTOMATION"
  | "ABSENCE_CANDIDATES";

export type ApprovedLeaveExcusedEmployee = {
  empId: number;
  empNumber: string;
  scheduleId: number | null;
};

export type ApprovedLeaveExcusedCreationResult =
  | {
      created: true;
      attendanceId: number;
      leaveId: number;
      leaveTypeName: string;
    }
  | {
      created: false;
      reason:
        | "NO_APPROVED_LEAVE"
        | "ATTENDANCE_ALREADY_EXISTS"
        | "NO_ASSIGNED_SCHEDULE";
      attendanceId?: number;
    };

type CreateApprovedLeaveExcusedInput = {
  tx: Prisma.TransactionClient;
  employee: ApprovedLeaveExcusedEmployee;
  attDate: Date;
  actorUserId: number | null;
  generationSource?: ApprovedLeaveExcusedGenerationSource;
};

function buildExcusedAuditValue(input: {
  attendanceId: number;
  employee: ApprovedLeaveExcusedEmployee;
  attDate: Date;
  leave: {
    leaveId: number;
    dateFrom: Date;
    dateTo: Date;
    leaveType: {
      name: string;
    };
  };
  actorUserId: number | null;
  generationSource: ApprovedLeaveExcusedGenerationSource;
}): Prisma.InputJsonObject {
  return {
    attendanceId: input.attendanceId,
    empId: input.employee.empId,
    empNumber: input.employee.empNumber,
    scheduleId: input.employee.scheduleId,
    attDate: input.attDate.toISOString(),
    status: "EXCUSED",
    timeIn: null,
    timeOut: null,
    totalMinutes: null,
    isManual: false,
    leaveId: input.leave.leaveId,
    leaveTypeName: input.leave.leaveType.name,
    leaveDateFrom: input.leave.dateFrom.toISOString(),
    leaveDateTo: input.leave.dateTo.toISOString(),
    generatedById: input.actorUserId,
    generationSource: input.generationSource,
  };
}

export async function createExcusedAttendanceForApprovedLeave({
  tx,
  employee,
  attDate,
  actorUserId,
  generationSource = "APPROVED_LEAVE",
}: CreateApprovedLeaveExcusedInput): Promise<ApprovedLeaveExcusedCreationResult> {
  if (!employee.scheduleId) {
    return {
      created: false,
      reason: "NO_ASSIGNED_SCHEDULE",
    };
  }

  const existingAttendance = await tx.attendance.findUnique({
    where: {
      empId_attDate: {
        empId: employee.empId,
        attDate,
      },
    },
    select: {
      attendanceId: true,
    },
  });

  if (existingAttendance) {
    return {
      created: false,
      reason: "ATTENDANCE_ALREADY_EXISTS",
      attendanceId: existingAttendance.attendanceId,
    };
  }

  const approvedLeave = await tx.leave.findFirst({
    where: {
      empId: employee.empId,
      status: "APPROVED",
      dateFrom: {
        lte: attDate,
      },
      dateTo: {
        gte: attDate,
      },
    },
    select: {
      leaveId: true,
      dateFrom: true,
      dateTo: true,
      leaveType: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      {
        dateFrom: "asc",
      },
      {
        leaveId: "asc",
      },
    ],
  });

  if (!approvedLeave) {
    return {
      created: false,
      reason: "NO_APPROVED_LEAVE",
    };
  }

  const attendance = await tx.attendance.create({
    data: {
      empId: employee.empId,
      scheduleId: employee.scheduleId,
      attDate,
      timeIn: null,
      timeOut: null,
      status: "EXCUSED",
      totalMinutes: null,
      isManual: false,
      createdById: actorUserId,
      updatedById: actorUserId,
    },
    select: {
      attendanceId: true,
    },
  });

  await tx.activityLog.create({
    data: {
      actorUserId,
      action: "ATTENDANCE_EXCUSED_AUTO_GENERATED",
      entityType: "attendance",
      entityId: String(attendance.attendanceId),
      oldValue: {
        attendanceExisted: false,
      },
      newValue: buildExcusedAuditValue({
        attendanceId: attendance.attendanceId,
        employee,
        attDate,
        leave: approvedLeave,
        actorUserId,
        generationSource,
      }),
    },
  });

  return {
    created: true,
    attendanceId: attendance.attendanceId,
    leaveId: approvedLeave.leaveId,
    leaveTypeName: approvedLeave.leaveType.name,
  };
}