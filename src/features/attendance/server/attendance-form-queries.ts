import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";

export type AttendanceEmployeeOption = {
  empId: number;
  empNumber: string;
  fullName: string;
  departmentName: string;
  scheduleName: string;
};

export type AttendanceBranchOption = {
  branchId: number;
  name: string;
};

export type AttendanceFormOptions = {
  employees: AttendanceEmployeeOption[];
  branches: AttendanceBranchOption[];
};

export async function getAttendanceFormOptions(): Promise<AttendanceFormOptions> {
  const [employees, branches] = await Promise.all([
    prisma.employee.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        empId: true,
        empNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        department: {
          select: {
            name: true,
          },
        },
        schedule: {
          select: {
            name: true,
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
      take: 500,
    }),

    prisma.branch.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        branchId: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    employees: employees.map((employee) => ({
      empId: employee.empId,
      empNumber: employee.empNumber,
      fullName: formatFullName({
        firstName: employee.firstName,
        middleName: employee.middleName,
        lastName: employee.lastName,
      }),
      departmentName: employee.department?.name ?? "—",
      scheduleName: employee.schedule?.name ?? "—",
    })),
    branches,
  };
}