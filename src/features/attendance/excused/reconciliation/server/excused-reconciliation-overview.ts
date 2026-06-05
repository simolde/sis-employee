import { prisma } from "@/lib/db/prisma";

export type ExcusedReconciliationOverviewStats = {
  automaticExcusedChecked: number;
  protectedByApprovedLeave: number;
  rollbackEligible: number;
  missingGenerationProvenance: number;
  rollbackAuditLogs: number;
};

type AutomaticExcusedRecord = {
  attendanceId: number;
  empId: number;
  attDate: Date;
};

type ApprovedLeaveCoverage = {
  empId: number;
  dateFrom: Date;
  dateTo: Date;
};

function isCoveredByApprovedLeave(input: {
  record: AutomaticExcusedRecord;
  approvedLeaves: ApprovedLeaveCoverage[];
}): boolean {
  return input.approvedLeaves.some(
    (leave) =>
      leave.empId === input.record.empId &&
      leave.dateFrom.getTime() <= input.record.attDate.getTime() &&
      leave.dateTo.getTime() >= input.record.attDate.getTime(),
  );
}

function getMinimumAttendanceDate(
  records: AutomaticExcusedRecord[],
): Date | null {
  if (records.length === 0) {
    return null;
  }

  return new Date(
    Math.min(...records.map((record) => record.attDate.getTime())),
  );
}

function getMaximumAttendanceDate(
  records: AutomaticExcusedRecord[],
): Date | null {
  if (records.length === 0) {
    return null;
  }

  return new Date(
    Math.max(...records.map((record) => record.attDate.getTime())),
  );
}

export async function getExcusedReconciliationOverviewStats(): Promise<ExcusedReconciliationOverviewStats> {
  const automaticExcusedRecords = await prisma.attendance.findMany({
    where: {
      status: "EXCUSED",
      isManual: false,
      timeIn: null,
      timeOut: null,
    },
    select: {
      attendanceId: true,
      empId: true,
      attDate: true,
    },
  });

  const attendanceIds = automaticExcusedRecords.map((record) =>
    String(record.attendanceId),
  );

  const employeeIds = Array.from(
    new Set(automaticExcusedRecords.map((record) => record.empId)),
  );

  const minimumAttendanceDate = getMinimumAttendanceDate(
    automaticExcusedRecords,
  );

  const maximumAttendanceDate = getMaximumAttendanceDate(
    automaticExcusedRecords,
  );

  const [approvedLeaves, generationLogs, rollbackAuditLogs] =
    await Promise.all([
      employeeIds.length > 0 &&
      minimumAttendanceDate &&
      maximumAttendanceDate
        ? prisma.leave.findMany({
            where: {
              empId: {
                in: employeeIds,
              },
              status: "APPROVED",
              dateFrom: {
                lte: maximumAttendanceDate,
              },
              dateTo: {
                gte: minimumAttendanceDate,
              },
            },
            select: {
              empId: true,
              dateFrom: true,
              dateTo: true,
            },
          })
        : Promise.resolve([]),

      attendanceIds.length > 0
        ? prisma.activityLog.findMany({
            where: {
              action: "ATTENDANCE_EXCUSED_AUTO_GENERATED",
              entityType: "attendance",
              entityId: {
                in: attendanceIds,
              },
            },
            select: {
              entityId: true,
            },
          })
        : Promise.resolve([]),

      prisma.activityLog.count({
        where: {
          action: "ATTENDANCE_EXCUSED_AUTO_ROLLED_BACK",
          entityType: "attendance",
        },
      }),
    ]);

  const generatedAttendanceIds = new Set(
    generationLogs
      .map((log) => Number(log.entityId))
      .filter((attendanceId) => Number.isInteger(attendanceId)),
  );

  let protectedByApprovedLeave = 0;
  let rollbackEligible = 0;
  let missingGenerationProvenance = 0;

  for (const record of automaticExcusedRecords) {
    const hasApprovedLeave = isCoveredByApprovedLeave({
      record,
      approvedLeaves,
    });

    if (hasApprovedLeave) {
      protectedByApprovedLeave += 1;
      continue;
    }

    if (generatedAttendanceIds.has(record.attendanceId)) {
      rollbackEligible += 1;
      continue;
    }

    missingGenerationProvenance += 1;
  }

  return {
    automaticExcusedChecked: automaticExcusedRecords.length,
    protectedByApprovedLeave,
    rollbackEligible,
    missingGenerationProvenance,
    rollbackAuditLogs,
  };
}