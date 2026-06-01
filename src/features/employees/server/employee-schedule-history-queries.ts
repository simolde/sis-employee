import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/features/auth/server/session";
import { canManageEmployees } from "@/lib/security/roles";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  EmployeeScheduleHistoryData,
  EmployeeScheduleHistoryItem,
} from "../types/employee-schedule-history-types";

function parseEmployeeId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function formatTime(value: string): string {
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  return value;
}

function formatShiftTime(input: {
  startTime: string;
  endTime: string;
  isOvernight: boolean;
}): string {
  const startTime = formatTime(input.startTime);
  const endTime = formatTime(input.endTime);
  const overnightLabel = input.isOvernight ? " · Overnight" : "";

  return `${startTime} - ${endTime}${overnightLabel}`;
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function mapAssignment(input: {
  assignmentId: number;
  validFrom: Date;
  validTo: Date | null;
  isActive: boolean;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
  schedule: {
    scheduleCode: string;
    name: string;
    daysOfWeek: string | null;
    shift: {
      shiftCode: string;
      name: string;
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  };
  assignedBy: {
    username: string;
    email: string;
    employee: {
      firstName: string;
      middleName: string | null;
      lastName: string;
    } | null;
  } | null;
}): EmployeeScheduleHistoryItem {
  const assignedByName = input.assignedBy?.employee
    ? formatFullName({
        firstName: input.assignedBy.employee.firstName,
        middleName: input.assignedBy.employee.middleName,
        lastName: input.assignedBy.employee.lastName,
      })
    : input.assignedBy?.username;

  return {
    assignmentId: input.assignmentId,
    scheduleCode: input.schedule.scheduleCode,
    scheduleName: input.schedule.name,
    shiftCode: input.schedule.shift.shiftCode,
    shiftName: input.schedule.shift.name,
    shiftTime: formatShiftTime({
      startTime: input.schedule.shift.startTime,
      endTime: input.schedule.shift.endTime,
      isOvernight: input.schedule.shift.isOvernight,
    }),
    daysOfWeek: input.schedule.daysOfWeek ?? "—",
    validFrom: formatDate(input.validFrom),
    validTo: formatDate(input.validTo),
    isActive: input.isActive,
    assignedBy: assignedByName ?? "—",
    remarks: input.remarks ?? "—",
    createdAt: formatDateTime(input.createdAt),
    updatedAt: formatDateTime(input.updatedAt),
  };
}

export async function getEmployeeScheduleHistoryData(
  empId: string,
): Promise<EmployeeScheduleHistoryData | null> {
  const session = await getCurrentSession();

  if (!session || !canManageEmployees(session.role)) {
    return null;
  }

  const employeeId = parseEmployeeId(empId);

  if (!employeeId) {
    return null;
  }

  const employee = await prisma.employee.findUnique({
    where: {
      empId: employeeId,
    },
    select: {
      empId: true,
      empNumber: true,
      firstName: true,
      middleName: true,
      lastName: true,
      branch: {
        select: {
          name: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
      designation: {
        select: {
          name: true,
        },
      },
      schedule: {
        select: {
          scheduleCode: true,
          name: true,
          shift: {
            select: {
              shiftCode: true,
              name: true,
              startTime: true,
              endTime: true,
              isOvernight: true,
            },
          },
        },
      },
      employeeScheduleAssignments: {
        select: {
          assignmentId: true,
          validFrom: true,
          validTo: true,
          isActive: true,
          remarks: true,
          createdAt: true,
          updatedAt: true,
          schedule: {
            select: {
              scheduleCode: true,
              name: true,
              daysOfWeek: true,
              shift: {
                select: {
                  shiftCode: true,
                  name: true,
                  startTime: true,
                  endTime: true,
                  isOvernight: true,
                },
              },
            },
          },
          assignedBy: {
            select: {
              username: true,
              email: true,
              employee: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            isActive: "desc",
          },
          {
            validFrom: "desc",
          },
          {
            assignmentId: "desc",
          },
        ],
      },
    },
  });

  if (!employee) {
    return null;
  }

  const assignments = employee.employeeScheduleAssignments.map(mapAssignment);
  const activeAssignments = assignments.filter(
    (assignment) => assignment.isActive,
  ).length;

  return {
    employee: {
      empId: employee.empId,
      empNumber: employee.empNumber,
      fullName: formatFullName({
        firstName: employee.firstName,
        middleName: employee.middleName,
        lastName: employee.lastName,
      }),
      branchName: employee.branch.name,
      departmentName: dash(employee.department?.name),
      designationName: dash(employee.designation?.name),
      currentScheduleCode: employee.schedule?.scheduleCode ?? "—",
      currentScheduleName: employee.schedule?.name ?? "No current schedule",
      currentShiftName: employee.schedule?.shift.name ?? "—",
      currentShiftTime: employee.schedule
        ? formatShiftTime({
            startTime: employee.schedule.shift.startTime,
            endTime: employee.schedule.shift.endTime,
            isOvernight: employee.schedule.shift.isOvernight,
          })
        : "—",
    },
    assignments,
    summary: {
      totalAssignments: assignments.length,
      activeAssignments,
      inactiveAssignments: assignments.length - activeAssignments,
    },
  };
}