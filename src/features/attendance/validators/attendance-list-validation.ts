import { z } from "zod";
import {
  attendanceSourceValues,
  attendanceStatusValues,
  type AttendanceListSearchParams,
  type AttendanceSourceFilterValue,
  type AttendanceStatusFilterValue,
} from "../types/attendance-types";

const statusFilterValues = ["ALL", ...attendanceStatusValues] as const;
const sourceFilterValues = ["ALL", ...attendanceSourceValues] as const;

const attendanceListSearchParamsSchema = z.object({
  q: z.string().trim().catch(""),
  status: z.enum(statusFilterValues).catch("ALL"),
  source: z.enum(sourceFilterValues).catch("ALL"),
  dateFrom: z.string().trim().catch(""),
  dateTo: z.string().trim().catch(""),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(5).max(50).catch(10),
  detailId: z.string().trim().catch(""),
});

function getSearchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseAttendanceListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AttendanceListSearchParams {
  const parsed = attendanceListSearchParamsSchema.parse({
    q: getSearchParamValue(searchParams.q),
    status: getSearchParamValue(searchParams.status),
    source: getSearchParamValue(searchParams.source),
    dateFrom: getSearchParamValue(searchParams.dateFrom),
    dateTo: getSearchParamValue(searchParams.dateTo),
    page: getSearchParamValue(searchParams.page),
    pageSize: getSearchParamValue(searchParams.pageSize),
    detailId: getSearchParamValue(searchParams.detailId),
  });

  return {
    q: parsed.q,
    status: parsed.status as AttendanceStatusFilterValue,
    source: parsed.source as AttendanceSourceFilterValue,
    dateFrom: parsed.dateFrom,
    dateTo: parsed.dateTo,
    page: parsed.page,
    pageSize: parsed.pageSize,
    detailId: parsed.detailId,
  };
}