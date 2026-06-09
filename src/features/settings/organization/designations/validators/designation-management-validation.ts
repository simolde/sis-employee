import { z } from "zod";
import {
  DESIGNATION_STATUSES,
  type DesignationFormActionState,
  type DesignationFormField,
  type DesignationFormInput,
} from "../types/designation-management-types";

export const designationFormSchema =
  z.object({
    designationCode:
      z
        .string()
        .trim()
        .min(
          1,
          "Designation code is required.",
        )
        .max(
          50,
          "Designation code cannot exceed 50 characters.",
        )
        .regex(
          /^[A-Za-z0-9_-]+$/,
          "Designation code may contain letters, numbers, underscores, and hyphens only.",
        )
        .transform(
          (value) =>
            value.toUpperCase(),
        ),

    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Designation name must contain at least 2 characters.",
        )
        .max(
          191,
          "Designation name cannot exceed 191 characters.",
        ),

    status:
      z.enum(
        DESIGNATION_STATUSES,
      ),
  });

export const designationStatusChangeSchema =
  z.object({
    designationId:
      z
        .coerce
        .number()
        .int()
        .positive(),

    status:
      z.enum(
        DESIGNATION_STATUSES,
      ),
  });

export const designationDeleteSchema =
  z.object({
    designationId:
      z
        .coerce
        .number()
        .int()
        .positive(),
  });

export type DesignationFormParseResult =
  | {
      ok: true;

      data: DesignationFormInput;
    }
  | {
      ok: false;

      fieldErrors: Partial<
        Record<
          DesignationFormField,
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

export function parseDesignationFormData(
  formData: FormData,
): DesignationFormParseResult {
  const result =
    designationFormSchema.safeParse({
      designationCode:
        readFormString(
          formData,
          "designationCode",
        ),

      name:
        readFormString(
          formData,
          "name",
        ),

      status:
        readFormString(
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
      DesignationFormField,
      string[]
    >
  > = {};

  for (
    const issue of
    result.error.issues
  ) {
    const field =
      issue.path[0];

    if (
      typeof field !== "string"
    ) {
      continue;
    }

    const typedField =
      field as DesignationFormField;

    fieldErrors[typedField] = [
      ...(
        fieldErrors[typedField] ??
        []
      ),
      issue.message,
    ];
  }

  return {
    ok: false,
    fieldErrors,
  };
}

export const INITIAL_DESIGNATION_FORM_ACTION_STATE: DesignationFormActionState =
  {
    status: "IDLE",

    message: "",

    fieldErrors: {},

    designationId: null,
  };