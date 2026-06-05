import type { AttendanceExceptionType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  getAttendanceExceptionOptions,
} from "./attendance-exception-queries";
import type {
  AttendanceExceptionOptions,
} from "../types/attendance-exception-types";

export type AttendanceExceptionEditData = {
  exceptionId: number;
  exceptionDateInput: string;
  branchId: string;
  exceptionType: AttendanceExceptionType;
  title: string;
  description: string;
  affectsAbsenceGeneration: boolean;
  status: string;
  options: AttendanceExceptionOptions;
};

function formatDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getAttendanceExceptionEditData(
  exceptionId: number,
): Promise<AttendanceExceptionEditData | null> {
  const [exception, options] = await Promise.all([
    prisma.attendanceExceptionDate.findUnique({
      where: {
        exceptionId,
      },
      select: {
        exceptionId: true,
        exceptionDate: true,
        branchId: true,
        exceptionType: true,
        title: true,
        description: true,
        affectsAbsenceGeneration: true,
        status: true,
      },
    }),

    getAttendanceExceptionOptions(),
  ]);

  if (!exception) {
    return null;
  }

  return {
    exceptionId: exception.exceptionId,
    exceptionDateInput: formatDateInputValue(exception.exceptionDate),
    branchId: exception.branchId ? String(exception.branchId) : "",
    exceptionType: exception.exceptionType,
    title: exception.title,
    description: exception.description ?? "",
    affectsAbsenceGeneration: exception.affectsAbsenceGeneration,
    status: exception.status,
    options,
  };
}