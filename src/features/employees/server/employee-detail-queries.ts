import { prisma } from "@/lib/db/prisma";
import { formatFullName, formatMinutesToHours } from "@/lib/utils/formatting";
import type {
  EmployeeDetail,
  EmployeeRecentAttendance,
} from "../types/employee-types";

function parseEmployeeId(empId: string): number | null {
  const parsed = Number(empId);

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

function formatTime(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function mapRecentAttendance(
  attendance: {
    attendanceId: number;
    attDate: Date;
    timeIn: Date | null;
    timeOut: Date | null;
    status: string;
    totalMinutes: number | null;
    inSource: string | null;
    outSource: string | null;
    inBranch: {
      name: string;
    } | null;
    outBranch: {
      name: string;
    } | null;
  },
): EmployeeRecentAttendance {
  return {
    attendanceId: attendance.attendanceId,
    attDate: formatDate(attendance.attDate),
    timeIn: formatTime(attendance.timeIn),
    timeOut: formatTime(attendance.timeOut),
    status: attendance.status,
    totalHours: formatMinutesToHours(attendance.totalMinutes),
    source: attendance.outSource ?? attendance.inSource ?? "—",
    branch: attendance.outBranch?.name ?? attendance.inBranch?.name ?? "—",
  };
}

export async function getEmployeeDetail(
  empId: string,
): Promise<EmployeeDetail | null> {
  const employeeId = parseEmployeeId(empId);

  if (!employeeId) {
    return null;
  }

  const [
    employee,
    roles,
    totalRecords,
    onTime,
    late,
    pendingReview,
    missingTimeout,
    recentAttendance,
  ] = await Promise.all([
    prisma.employee.findUnique({
      where: {
        empId: employeeId,
      },
      select: {
        empId: true,
        empNumber: true,
        prc: true,
        lastName: true,
        firstName: true,
        middleName: true,
        gender: true,
        dob: true,
        pob: true,
        email: true,
        phone: true,
        landline: true,
        civilStatus: true,
        citizenship: true,
        address: true,
        isFlexible: true,
        avLeave: true,
        sss: true,
        pagibig: true,
        philhealth: true,
        tin: true,
        img: true,
        dateHired: true,
        dateSigned: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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
        empType: {
          select: {
            name: true,
          },
        },
        schedule: {
          select: {
            name: true,
            shift: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
          },
        },
        user: {
          select: {
            userId: true,
            username: true,
            email: true,
            status: true,
            mustChangePassword: true,
            failedAttempts: true,
            isLocked: true,
            lockoutUntil: true,
            lastLoginAt: true,
            role: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        rfidCards: {
          select: {
            rfidId: true,
            rfidUid: true,
            status: true,
            assignedAt: true,
            disabledAt: true,
            remarks: true,
          },
          orderBy: {
            assignedAt: "desc",
          },
          take: 10,
        },
      },
    }),

    prisma.role.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        roleId: true,
        code: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.attendance.count({
      where: {
        empId: employeeId,
      },
    }),

    prisma.attendance.count({
      where: {
        empId: employeeId,
        status: "ON_TIME",
      },
    }),

    prisma.attendance.count({
      where: {
        empId: employeeId,
        status: "LATE",
      },
    }),

    prisma.attendance.count({
      where: {
        empId: employeeId,
        status: "PENDING_REVIEW",
      },
    }),

    prisma.attendance.count({
      where: {
        empId: employeeId,
        OR: [
          {
            status: "MISSING_TIMEOUT",
          },
          {
            timeOut: null,
          },
        ],
      },
    }),

    prisma.attendance.findMany({
      where: {
        empId: employeeId,
      },
      select: {
        attendanceId: true,
        attDate: true,
        timeIn: true,
        timeOut: true,
        status: true,
        totalMinutes: true,
        inSource: true,
        outSource: true,
        inBranch: {
          select: {
            name: true,
          },
        },
        outBranch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        attDate: "desc",
      },
      take: 8,
    }),
  ]);

  if (!employee) {
    return null;
  }

  const fullName = formatFullName({
    firstName: employee.firstName,
    middleName: employee.middleName,
    lastName: employee.lastName,
  });

  return {
    profile: {
      empId: employee.empId,
      empNumber: employee.empNumber,
      fullName,
      prc: employee.prc ?? "—",
      gender: employee.gender ?? "—",
      dob: formatDate(employee.dob),
      pob: employee.pob ?? "—",
      email: employee.email ?? "—",
      phone: employee.phone ?? "—",
      landline: employee.landline ?? "—",
      civilStatus: employee.civilStatus ?? "—",
      citizenship: employee.citizenship ?? "—",
      address: employee.address ?? "—",
      branchName: employee.branch.name,
      departmentName: employee.department?.name ?? "—",
      designationName: employee.designation?.name ?? "—",
      empTypeName: employee.empType?.name ?? "—",
      scheduleName: employee.schedule?.name ?? "—",
      shiftTime: employee.schedule
        ? `${employee.schedule.shift.startTime} - ${employee.schedule.shift.endTime}`
        : "—",
      isFlexible: employee.isFlexible,
      avLeave: employee.avLeave,
      sss: employee.sss ?? "—",
      pagibig: employee.pagibig ?? "—",
      philhealth: employee.philhealth ?? "—",
      tin: employee.tin ?? "—",
      img: employee.img,
      dateHired: formatDate(employee.dateHired),
      dateSigned: formatDate(employee.dateSigned),
      status: employee.status,
      createdAt: formatDateTime(employee.createdAt),
      updatedAt: formatDateTime(employee.updatedAt),
    },
    account: employee.user
      ? {
          userId: employee.user.userId,
          username: employee.user.username,
          email: employee.user.email,
          roleName: employee.user.role.name,
          roleCode: employee.user.role.code,
          status: employee.user.status,
          mustChangePassword: employee.user.mustChangePassword,
          failedAttempts: employee.user.failedAttempts,
          isLocked: employee.user.isLocked,
          lockoutUntil: formatDateTime(employee.user.lockoutUntil),
          lastLoginAt: formatDateTime(employee.user.lastLoginAt),
        }
      : null,
    accountRoleOptions: roles.map((role) => ({
      value: String(role.roleId),
      label: `${role.name} (${role.code})`,
      code: role.code,
    })),
    rfidCards: employee.rfidCards.map((rfidCard) => ({
      rfidId: rfidCard.rfidId,
      rfidUid: rfidCard.rfidUid,
      status: rfidCard.status,
      assignedAt: formatDateTime(rfidCard.assignedAt),
      disabledAt: formatDateTime(rfidCard.disabledAt),
      remarks: rfidCard.remarks ?? "—",
    })),
    attendanceSummary: {
      totalRecords,
      onTime,
      late,
      pendingReview,
      missingTimeout,
    },
    recentAttendance: recentAttendance.map(mapRecentAttendance),
  };
}