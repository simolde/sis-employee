import type { AttendanceExceptionType } from "@/generated/prisma/client";

export type AttendanceExceptionFilters = {
  q: string;
  branchId: string;
  type: string;
  dateFrom: string;
  dateTo: string;
  activeOnly: boolean;
};

export type AttendanceExceptionOption = {
  id: number;
  label: string;
};

export type AttendanceExceptionOptions = {
  branches: AttendanceExceptionOption[];
};

export type AttendanceExceptionItem = {
  exceptionId: number;
  exceptionDate: string;
  branchName: string;
  exceptionType: AttendanceExceptionType;
  title: string;
  description: string;
  affectsAbsenceGeneration: boolean;
  status: string;
  createdAt: string;
};

export type AttendanceExceptionResult = {
  filters: AttendanceExceptionFilters;
  options: AttendanceExceptionOptions;
  records: AttendanceExceptionItem[];
  summary: {
    totalActiveExceptions: number;
    totalMatchingExceptions: number;
    affectsAbsenceGeneration: number;
    currentPageRecords: number;
  };
};

export type AttendanceExceptionActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAttendanceExceptionActionState: AttendanceExceptionActionState =
  {
    ok: false,
    message: "",
  };