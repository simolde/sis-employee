import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import {
  type EmployeeEditData,
  type EmployeeEditFormData,
  type EmployeeFormOptions,
  type EmployeeListItem,
  type EmployeeListResult,
  type EmployeeListSearchParams,
  type EmployeeStatusValue,
} from "../types/employee-types";

function buildEmployeeWhere(
  filters: EmployeeListSearchParams,
): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = {};

  if (filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.q) {
    where.OR = [
      {
        empNumber: {
          contains: filters.q,
        },
      },
      {
        firstName: {
          contains: filters.q,
        },
      },
      {
        middleName: {
          contains: filters.q,
        },
      },
      {
        lastName: {
          contains: filters.q,
        },
      },
      {
        email: {
          contains: filters.q,
        },
      },
      {
        phone: {
          contains: filters.q,
        },
      },
      {
        department: {
          name: {
            contains: filters.q,
          },
        },
      },
      {
        branch: {
          name: {
            contains: filters.q,
          },
        },
      },
    ];
  }

  return where;
}

function parseEmployeeId(empId: string): number | null {
  const parsed = Number(empId);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function formatDate(date: Date | null): string {
  if (!date) {
    return "—";
  }

  return date.toISOString().slice(0, 10);
}

function formatDateForInput(date: Date | null): string {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function nullableString(value: string | null): string {
  return value ?? "";
}

function nullableId(value: number | null): string {
  return value ? String(value) : "";
}

function mapEmployeeListItem(employee: {
  empId: number;
  empNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: EmployeeStatusValue;
  dateHired: Date | null;
  branch: {
    name: string;
  };
  department: {
    name: string;
  } | null;
  designation: {
    name: string;
  } | null;
}): EmployeeListItem {
  return {
    empId: employee.empId,
    empNumber: employee.empNumber,
    fullName: formatFullName({
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
    }),
    email: employee.email ?? "—",
    phone: employee.phone ?? "—",
    branchName: employee.branch.name,
    departmentName: employee.department?.name ?? "—",
    designationName: employee.designation?.name ?? "—",
    status: employee.status,
    dateHired: formatDate(employee.dateHired),
  };
}

export async function getEmployeeList(
  filters: EmployeeListSearchParams,
): Promise<EmployeeListResult> {
  const where = buildEmployeeWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    employees,
    totalItems,
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    onLeaveEmployees,
  ] = await Promise.all([
    prisma.employee.findMany({
      where,
      select: {
        empId: true,
        empNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        dateHired: true,
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
      },
      orderBy: [
        {
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
      ],
      skip,
      take: filters.pageSize,
    }),

    prisma.employee.count({
      where,
    }),

    prisma.employee.count(),

    prisma.employee.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.employee.count({
      where: {
        status: "INACTIVE",
      },
    }),

    prisma.employee.count({
      where: {
        status: "ON_LEAVE",
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    employees: employees.map(mapEmployeeListItem),
    summary: {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onLeaveEmployees,
    },
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    },
    filters,
  };
}

export async function getEmployeeCreateFormOptions(): Promise<EmployeeFormOptions> {
  const [branches, departments, designations, empTypes, schedules] =
    await Promise.all([
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

      prisma.department.findMany({
        where: {
          status: "ACTIVE",
        },
        select: {
          departmentId: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.designation.findMany({
        where: {
          status: "ACTIVE",
        },
        select: {
          designationId: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.empType.findMany({
        where: {
          status: "ACTIVE",
        },
        select: {
          empTypeId: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.shiftSchedule.findMany({
        where: {
          status: "ACTIVE",
        },
        select: {
          scheduleId: true,
          name: true,
          shift: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  return {
    branches: branches.map((branch) => ({
      value: String(branch.branchId),
      label: branch.name,
    })),
    departments: departments.map((department) => ({
      value: String(department.departmentId),
      label: department.name,
    })),
    designations: designations.map((designation) => ({
      value: String(designation.designationId),
      label: designation.name,
    })),
    empTypes: empTypes.map((empType) => ({
      value: String(empType.empTypeId),
      label: empType.name,
    })),
    schedules: schedules.map((schedule) => ({
      value: String(schedule.scheduleId),
      label: `${schedule.name} · ${schedule.shift.startTime}-${schedule.shift.endTime}`,
    })),
  };
}

function mapEmployeeEditFormData(employee: {
  empId: number;
  empNumber: string;
  prc: string | null;
  lastName: string;
  firstName: string;
  middleName: string | null;
  gender: string | null;
  dob: Date | null;
  pob: string | null;
  email: string | null;
  phone: string | null;
  landline: string | null;
  civilStatus: string | null;
  citizenship: string | null;
  address: string | null;
  branchId: number;
  departmentId: number | null;
  designationId: number | null;
  empTypeId: number | null;
  scheduleId: number | null;
  isFlexible: boolean;
  avLeave: number;
  sss: string | null;
  pagibig: string | null;
  philhealth: string | null;
  tin: string | null;
  img: string | null;
  dateHired: Date | null;
  dateSigned: Date | null;
  status: EmployeeStatusValue;
}): EmployeeEditFormData {
  return {
    empId: employee.empId,
    empNumber: employee.empNumber,
    prc: nullableString(employee.prc),
    lastName: employee.lastName,
    firstName: employee.firstName,
    middleName: nullableString(employee.middleName),
    gender: nullableString(employee.gender),
    dob: formatDateForInput(employee.dob),
    pob: nullableString(employee.pob),
    email: nullableString(employee.email),
    phone: nullableString(employee.phone),
    landline: nullableString(employee.landline),
    civilStatus: nullableString(employee.civilStatus),
    citizenship: nullableString(employee.citizenship),
    address: nullableString(employee.address),
    branchId: String(employee.branchId),
    departmentId: nullableId(employee.departmentId),
    designationId: nullableId(employee.designationId),
    empTypeId: nullableId(employee.empTypeId),
    scheduleId: nullableId(employee.scheduleId),
    isFlexible: employee.isFlexible,
    avLeave: String(employee.avLeave),
    sss: nullableString(employee.sss),
    pagibig: nullableString(employee.pagibig),
    philhealth: nullableString(employee.philhealth),
    tin: nullableString(employee.tin),
    img: nullableString(employee.img),
    dateHired: formatDateForInput(employee.dateHired),
    dateSigned: formatDateForInput(employee.dateSigned),
    status: employee.status,
  };
}

export async function getEmployeeEditData(
  empId: string,
): Promise<EmployeeEditData | null> {
  const employeeId = parseEmployeeId(empId);

  if (!employeeId) {
    return null;
  }

  const [employee, options] = await Promise.all([
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
        branchId: true,
        departmentId: true,
        designationId: true,
        empTypeId: true,
        scheduleId: true,
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
      },
    }),
    getEmployeeCreateFormOptions(),
  ]);

  if (!employee) {
    return null;
  }

  return {
    employee: mapEmployeeEditFormData(employee),
    options,
  };
}