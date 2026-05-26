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

function normalize(value: string | null | undefined): string {
  return value?.toUpperCase().trim() ?? "";
}

function isOdlTeacherRecord(input: {
  departmentName: string | null | undefined;
  empTypeName: string | null | undefined;
  designationName: string | null | undefined;
}): boolean {
  const combinedText = [
    input.departmentName,
    input.empTypeName,
    input.designationName,
  ]
    .map(normalize)
    .join(" ");

  const hasOdl =
    combinedText.includes("ODL") ||
    combinedText.includes("ONLINE DISTANCE LEARNING");

  const hasTeacherRole =
    combinedText.includes("TEACHER") ||
    combinedText.includes("FACULTY") ||
    combinedText.includes("INSTRUCTOR");

  return hasOdl && hasTeacherRole;
}

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
        empType: {
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

  const odlTeachers = employees.filter((employee) =>
    isOdlTeacherRecord({
      departmentName: employee.department?.name,
      empTypeName: employee.empType?.name,
      designationName: employee.designation?.name,
    }),
  );

  return {
    employees: odlTeachers.map((employee) => ({
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