import { prisma } from "@/lib/db/prisma";
import type {
  DesignationListItem,
  DesignationPageData,
  EmployeeTypeListItem,
  EmployeeTypePageData,
  RecordStatusValue,
} from "../types/employment-setup-types";

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function mapDesignation(designation: {
  designationId: number;
  designationCode: string;
  name: string;
  status: RecordStatusValue;
  createdAt: Date;
  updatedAt: Date;
}): DesignationListItem {
  return {
    designationId: designation.designationId,
    designationCode: designation.designationCode,
    name: designation.name,
    status: designation.status,
    createdAt: formatDateTime(designation.createdAt),
    updatedAt: formatDateTime(designation.updatedAt),
  };
}

function mapEmployeeType(employeeType: {
  empTypeId: number;
  empTypeCode: string;
  name: string;
  status: RecordStatusValue;
  createdAt: Date;
  updatedAt: Date;
}): EmployeeTypeListItem {
  return {
    empTypeId: employeeType.empTypeId,
    empTypeCode: employeeType.empTypeCode,
    name: employeeType.name,
    status: employeeType.status,
    createdAt: formatDateTime(employeeType.createdAt),
    updatedAt: formatDateTime(employeeType.updatedAt),
  };
}

export async function getDesignationPageData(): Promise<DesignationPageData> {
  const designations = await prisma.designation.findMany({
    select: {
      designationId: true,
      designationCode: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  return {
    designations: designations.map(mapDesignation),
    summary: {
      total: designations.length,
      active: designations.filter(
        (designation) => designation.status === "ACTIVE",
      ).length,
      inactive: designations.filter(
        (designation) => designation.status === "INACTIVE",
      ).length,
      archived: designations.filter(
        (designation) => designation.status === "ARCHIVED",
      ).length,
    },
  };
}

export async function getEmployeeTypePageData(): Promise<EmployeeTypePageData> {
  const employeeTypes = await prisma.empType.findMany({
    select: {
      empTypeId: true,
      empTypeCode: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  return {
    employeeTypes: employeeTypes.map(mapEmployeeType),
    summary: {
      total: employeeTypes.length,
      active: employeeTypes.filter(
        (employeeType) => employeeType.status === "ACTIVE",
      ).length,
      inactive: employeeTypes.filter(
        (employeeType) => employeeType.status === "INACTIVE",
      ).length,
      archived: employeeTypes.filter(
        (employeeType) => employeeType.status === "ARCHIVED",
      ).length,
    },
  };
}