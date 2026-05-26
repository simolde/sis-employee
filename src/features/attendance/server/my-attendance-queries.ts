import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/features/auth/server/session";
import { formatFullName, formatMinutesToHours } from "@/lib/utils/formatting";
import type {
  AttendanceListItem,
  AttendanceStatusValue,
  MyAttendanceListResult,
} from "../types/attendance-types";

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

function mapAttendanceListItem(attendance: {
  attendanceId: number;
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  inSource: string | null;
  outSource: string | null;
  status: AttendanceStatusValue;
  totalMinutes: number | null;
  isManual: boolean;
  isSynced: boolean;
  employee: {
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    department: {
      name: string;
    } | null;
  };
  schedule: {
    name: string;
  } | null;
  inBranch: {
    name: string;
  } | null;
  outBranch: {
    name: string;
  } | null;
}): AttendanceListItem {
  return {
    attendanceId: attendance.attendanceId,
    empNumber: attendance.employee.empNumber,
    employeeName: formatFullName({
      firstName: attendance.employee.firstName,
      middleName: attendance.employee.middleName,
      lastName: attendance.employee.lastName,
    }),
    departmentName: attendance.employee.department?.name ?? "—",
    scheduleName: attendance.schedule?.name ?? "—",
    attDate: formatDate(attendance.attDate),
    timeIn: formatTime(attendance.timeIn),
    timeOut: formatTime(attendance.timeOut),
    source: attendance.outSource ?? attendance.inSource ?? "—",
    branchName: attendance.outBranch?.name ?? attendance.inBranch?.name ?? "—",
    status: attendance.status,
    totalHours: formatMinutesToHours(attendance.totalMinutes),
    isManual: attendance.isManual,
    isSynced: attendance.isSynced,
  };
}

export async function getMyAttendanceList(input: {
  page: number;
  pageSize: number;
}): Promise<MyAttendanceListResult> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      records: [],
      pagination: {
        page: 1,
        pageSize: input.pageSize,
        totalItems: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      empId: true,
    },
  });

  if (!user?.empId) {
    return {
      records: [],
      pagination: {
        page: 1,
        pageSize: input.pageSize,
        totalItems: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  const page = Math.max(1, input.page);
  const pageSize = Math.min(Math.max(input.pageSize, 5), 20);
  const skip = (page - 1) * pageSize;

  const [records, totalItems] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        empId: user.empId,
      },
      select: {
        attendanceId: true,
        attDate: true,
        timeIn: true,
        timeOut: true,
        inSource: true,
        outSource: true,
        status: true,
        totalMinutes: true,
        isManual: true,
        isSynced: true,
        employee: {
          select: {
            empNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        schedule: {
          select: {
            name: true,
          },
        },
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
      orderBy: [
        {
          attDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip,
      take: pageSize,
    }),

    prisma.attendance.count({
      where: {
        empId: user.empId,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return {
    records: records.map(mapAttendanceListItem),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}