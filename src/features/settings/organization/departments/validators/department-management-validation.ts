import { z } from "zod";
import {
  DEPARTMENT_STATUSES,
  type DepartmentFormActionState,
  type DepartmentFormField,
  type DepartmentFormInput,
} from "../types/department-management-types";

export const departmentFormSchema =
  z.object({
    departmentCode: z
      .string()
      .trim()
      .min(
        1,
        "Department code is required.",
      )
      .max(
        50,
        "Department code cannot exceed 50 characters.",
      )
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Department code may contain letters, numbers, underscores, and hyphens only.",
      )
      .transform((value) =>
        value.toUpperCase(),
      ),

    name: z
      .string()
      .trim()
      .min(
        2,
        "Department name must contain at least 2 characters.",
      )
      .max(
        191,
        "Department name cannot exceed 191 characters.",
      ),

    status: z.enum(
      DEPARTMENT_STATUSES,
    ),
  });

export const departmentStatusChangeSchema =
  z.object({
    departmentId: z.coerce
      .number()
      .int()
      .positive(),

    status: z.enum(
      DEPARTMENT_STATUSES,
    ),
  });

export const departmentDeleteSchema =
  z.object({
    departmentId: z.coerce
      .number()
      .int()
      .positive(),
  });

export type DepartmentFormParseResult =
  | {
      ok: true;
      data: DepartmentFormInput;
    }
  | {
      ok: false;

      fieldErrors: Partial<
        Record<
          DepartmentFormField,
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

export function parseDepartmentFormData(
  formData: FormData,
): DepartmentFormParseResult {
  const result =
    departmentFormSchema.safeParse({
      departmentCode: readFormString(
        formData,
        "departmentCode",
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
      DepartmentFormField,
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
      field as DepartmentFormField;

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

export const INITIAL_DEPARTMENT_FORM_ACTION_STATE: DepartmentFormActionState =
  {
    status: "IDLE",

    message: "",

    fieldErrors: {},

    departmentId: null,
  };