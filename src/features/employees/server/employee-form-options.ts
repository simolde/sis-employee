import { prisma } from "@/lib/db/prisma";
import type { EmployeeFormOptions } from "../types/employee-form-options-types";

function buildLabel(input: { code: string; name: string }): string {
  return `${input.code} · ${input.name}`;
}

export async function getEmployeeFormOptions(): Promise<EmployeeFormOptions> {
  const [branches, departments, designations, employeeTypes] =
    await Promise.all([
      prisma.branch.findMany({
        where: {
          status: "ACTIVE",
        },
        select: {
          branchId: true,
          branchCode: true,
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
          departmentCode: true,
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
          designationCode: true,
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
          empTypeCode: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  return {
    branches: branches.map((branch) => ({
      id: branch.branchId,
      code: branch.branchCode,
      name: branch.name,
      label: buildLabel({
        code: branch.branchCode,
        name: branch.name,
      }),
    })),

    departments: departments.map((department) => ({
      id: department.departmentId,
      code: department.departmentCode,
      name: department.name,
      label: buildLabel({
        code: department.departmentCode,
        name: department.name,
      }),
    })),

    designations: designations.map((designation) => ({
      id: designation.designationId,
      code: designation.designationCode,
      name: designation.name,
      label: buildLabel({
        code: designation.designationCode,
        name: designation.name,
      }),
    })),

    employeeTypes: employeeTypes.map((employeeType) => ({
      id: employeeType.empTypeId,
      code: employeeType.empTypeCode,
      name: employeeType.name,
      label: buildLabel({
        code: employeeType.empTypeCode,
        name: employeeType.name,
      }),
    })),
  };
}