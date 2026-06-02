import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  ManualAttendanceEmployeeOption,
  ManualAttendancePageData,
} from "../types/manual-attendance-types";

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function formatShiftTime(value: string): string {
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  return value;
}

function mapEmployeeOption(employee: {
  empId: number;
  empNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  branch: {
    name: string;
  };
  department: {
    name: string;
  } | null;
  schedule: {
    scheduleCode: string;
    name: string;
    shift: {
      shiftCode: string;
      name: string;
      startTime: string;
      endTime: string;
    };
  } | null;
}): ManualAttendanceEmployeeOption {
  const fullName = formatFullName({
    firstName: employee.firstName,
    middleName: employee.middleName,
    lastName: employee.lastName,
  });

  const scheduleName = employee.schedule
    ? `${employee.schedule.scheduleCode} · ${employee.schedule.name} (${employee.schedule.shift.shiftCode} ${formatShiftTime(
        employee.schedule.shift.startTime,
      )}-${formatShiftTime(employee.schedule.shift.endTime)})`
    : "No current schedule";

  return {
    empId: employee.empId,
    empNumber: employee.empNumber,
    fullName,
    branchName: employee.branch.name,
    departmentName: dash(employee.department?.name),
    scheduleName,
    label: `${employee.empNumber} · ${fullName} · ${employee.branch.name} · ${scheduleName}`,
  };
}

export async function getManualAttendancePageData(): Promise<ManualAttendancePageData> {
  const employees = await prisma.employee.findMany({
    where: {
      status: "ACTIVE",
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
    ],
  });

  return {
    employees: employees.map(mapEmployeeOption),
  };
}