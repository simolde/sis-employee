import { z } from "zod";
import {
  employeeStatusValues,
  type EmployeeListSearchParams,
  type EmployeeStatusFilterValue,
} from "../types/employee-types";

const statusFilterValues = ["ALL", ...employeeStatusValues] as const;

const employeeListSearchParamsSchema = z.object({
  q: z.string().trim().catch(""),
  status: z.enum(statusFilterValues).catch("ALL"),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(5).max(50).catch(10),
});

function getSearchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseEmployeeListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): EmployeeListSearchParams {
  const parsed = employeeListSearchParamsSchema.parse({
    q: getSearchParamValue(searchParams.q),
    status: getSearchParamValue(searchParams.status),
    page: getSearchParamValue(searchParams.page),
    pageSize: getSearchParamValue(searchParams.pageSize),
  });

  return {
    q: parsed.q,
    status: parsed.status as EmployeeStatusFilterValue,
    page: parsed.page,
    pageSize: parsed.pageSize,
  };
}