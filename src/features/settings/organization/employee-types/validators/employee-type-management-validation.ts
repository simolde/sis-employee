import { z } from "zod";
import {
  EMPLOYEE_TYPE_STATUSES,
  type EmployeeTypeFormActionState,
  type EmployeeTypeFormField,
  type EmployeeTypeFormInput,
} from "../types/employee-type-management-types";

export const employeeTypeFormSchema =
  z.object({
    empTypeCode: z
      .string()
      .trim()
      .min(
        1,
        "Employee type code is required.",
      )
      .max(
        50,
        "Employee type code cannot exceed 50 characters.",
      )
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Employee type code may contain letters, numbers, underscores, and hyphens only.",
      )
      .transform((value) =>
        value.toUpperCase(),
      ),

    name: z
      .string()
      .trim()
      .min(
        2,
        "Employee type name must contain at least 2 characters.",
      )
      .max(
        191,
        "Employee type name cannot exceed 191 characters.",
      ),

    status: z.enum(
      EMPLOYEE_TYPE_STATUSES,
    ),
  });

export const employeeTypeStatusChangeSchema =
  z.object({
    empTypeId: z.coerce
      .number()
      .int()
      .positive(),

    status: z.enum(
      EMPLOYEE_TYPE_STATUSES,
    ),
  });

export const employeeTypeDeleteSchema =
  z.object({
    empTypeId: z.coerce
      .number()
      .int()
      .positive(),
  });

export type EmployeeTypeFormParseResult =
  | {
      ok: true;

      data: EmployeeTypeFormInput;
    }
  | {
      ok: false;

      fieldErrors: Partial<
        Record<
          EmployeeTypeFormField,
          string[]
        >
      >;
    };

function readFormString(
  formData: FormData,
  name: string,
): string {
  const value =
    formData.get(name);

  return typeof value === "string"
    ? value
    : "";
}

export function parseEmployeeTypeFormData(
  formData: FormData,
): EmployeeTypeFormParseResult {
  const result =
    employeeTypeFormSchema.safeParse({
      empTypeCode: readFormString(
        formData,
        "empTypeCode",
      ),

      name: readFormString(
        formData,
        "name",
      ),

      status: readFormString(
        formData,
        "status",
      ),
    });

  if (result.success) {
    return {
      ok: true,
      data: result.data,
    };
  }

  const fieldErrors: Partial<
    Record<
      EmployeeTypeFormField,
      string[]
    >
  > = {};

  for (const issue of result.error.issues) {
    const field =
      issue.path[0];

    if (typeof field !== "string") {
      continue;
    }

    const typedField =
      field as EmployeeTypeFormField;

    fieldErrors[typedField] = [
      ...(fieldErrors[typedField] ?? []),
      issue.message,
    ];
  }

  return {
    ok: false,
    fieldErrors,
  };
}

export const INITIAL_EMPLOYEE_TYPE_FORM_ACTION_STATE: EmployeeTypeFormActionState =
  {
    status: "IDLE",

    message: "",

    fieldErrors: {},

    empTypeId: null,
  };