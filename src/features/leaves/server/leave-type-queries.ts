import { prisma } from "@/lib/db/prisma";
import type {
  LeaveTypeListItem,
  LeaveTypePageData,
  LeaveTypeStatusValue,
} from "../types/leave-type-types";

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

function mapLeaveType(leaveType: {
  leaveTypeId: number;
  name: string;
  code: string;
  isPaid: boolean;
  requiresAttachment: boolean;
  status: LeaveTypeStatusValue;
  createdAt: Date;
  updatedAt: Date;
}): LeaveTypeListItem {
  return {
    leaveTypeId: leaveType.leaveTypeId,
    name: leaveType.name,
    code: leaveType.code,
    isPaid: leaveType.isPaid,
    requiresAttachment: leaveType.requiresAttachment,
    status: leaveType.status,
    createdAt: formatDateTime(leaveType.createdAt),
    updatedAt: formatDateTime(leaveType.updatedAt),
  };
}

export async function getLeaveTypePageData(): Promise<LeaveTypePageData> {
  const leaveTypes = await prisma.leaveType.findMany({
    select: {
      leaveTypeId: true,
      name: true,
      code: true,
      isPaid: true,
      requiresAttachment: true,
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
    leaveTypes: leaveTypes.map(mapLeaveType),
    summary: {
      total: leaveTypes.length,
      active: leaveTypes.filter((item) => item.status === "ACTIVE").length,
      inactive: leaveTypes.filter((item) => item.status === "INACTIVE").length,
      archived: leaveTypes.filter((item) => item.status === "ARCHIVED").length,
      paid: leaveTypes.filter((item) => item.isPaid).length,
      requiresAttachment: leaveTypes.filter((item) => item.requiresAttachment)
        .length,
    },
  };
}