import { prisma } from "@/lib/db/prisma";
import type {
  BranchListItem,
  BranchPageData,
  DepartmentListItem,
  DepartmentPageData,
  RecordStatusValue,
} from "../types/organization-types";

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

function mapBranch(branch: {
  branchId: number;
  name: string;
  status: RecordStatusValue;
  createdAt: Date;
  updatedAt: Date;
}): BranchListItem {
  return {
    branchId: branch.branchId,
    name: branch.name,
    status: branch.status,
    createdAt: formatDateTime(branch.createdAt),
    updatedAt: formatDateTime(branch.updatedAt),
  };
}

function mapDepartment(department: {
  departmentId: number;
  name: string;
  status: RecordStatusValue;
  createdAt: Date;
  updatedAt: Date;
}): DepartmentListItem {
  return {
    departmentId: department.departmentId,
    name: department.name,
    status: department.status,
    createdAt: formatDateTime(department.createdAt),
    updatedAt: formatDateTime(department.updatedAt),
  };
}

export async function getBranchPageData(): Promise<BranchPageData> {
  const branches = await prisma.branch.findMany({
    select: {
      branchId: true,
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
    branches: branches.map(mapBranch),
    summary: {
      total: branches.length,
      active: branches.filter((branch) => branch.status === "ACTIVE").length,
      inactive: branches.filter((branch) => branch.status === "INACTIVE")
        .length,
      archived: branches.filter((branch) => branch.status === "ARCHIVED")
        .length,
    },
  };
}

export async function getDepartmentPageData(): Promise<DepartmentPageData> {
  const departments = await prisma.department.findMany({
    select: {
      departmentId: true,
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
    departments: departments.map(mapDepartment),
    summary: {
      total: departments.length,
      active: departments.filter(
        (department) => department.status === "ACTIVE",
      ).length,
      inactive: departments.filter(
        (department) => department.status === "INACTIVE",
      ).length,
      archived: departments.filter(
        (department) => department.status === "ARCHIVED",
      ).length,
    },
  };
}