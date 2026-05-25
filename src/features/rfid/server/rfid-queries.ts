import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type { RfidCardListItem, RfidPageData } from "../types/rfid-types";

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

function mapRfidCard(card: {
  rfidId: number;
  rfidUid: string;
  status: string;
  assignedAt: Date;
  disabledAt: Date | null;
  remarks: string | null;
  employee: {
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    department: {
      name: string;
    } | null;
    branch: {
      name: string;
    };
  };
}): RfidCardListItem {
  return {
    rfidId: card.rfidId,
    rfidUid: card.rfidUid,
    employeeName: formatFullName({
      firstName: card.employee.firstName,
      middleName: card.employee.middleName,
      lastName: card.employee.lastName,
    }),
    empNumber: card.employee.empNumber,
    departmentName: card.employee.department?.name ?? "—",
    branchName: card.employee.branch.name,
    status: card.status,
    assignedAt: formatDateTime(card.assignedAt),
    disabledAt: formatDateTime(card.disabledAt),
    remarks: card.remarks ?? "—",
  };
}

export async function getRfidPageData(): Promise<RfidPageData> {
  const [employees, rfidCards] = await Promise.all([
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
        branch: {
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
      take: 300,
    }),

    prisma.rfidCard.findMany({
      select: {
        rfidId: true,
        rfidUid: true,
        status: true,
        assignedAt: true,
        disabledAt: true,
        remarks: true,
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
            branch: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
      take: 100,
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
      branchName: employee.branch.name,
    })),
    rfidCards: rfidCards.map(mapRfidCard),
  };
}