import { z } from "zod";
import type {
  AttendancePolicyActionState,
  AttendancePolicyFormField,
  AttendancePolicyFormInput,
} from "../types/attendance-policy-types";

const relativeDirectorySchema =
  z
    .string()
    .trim()
    .min(
      1,
      "Photo directory is required.",
    )
    .max(
      191,
      "Photo directory cannot exceed 191 characters.",
    )
    .regex(
      /^[A-Za-z0-9/_-]+$/,
      "Use letters, numbers, forward slashes, underscores, and hyphens only.",
    )
    .refine(
      (value) =>
        !value.includes(".."),
      "Parent-directory traversal is not allowed.",
    )
    .refine(
      (value) =>
        !value.startsWith("/"),
      "Use a relative directory, not an absolute path.",
    )
    .transform((value) =>
      value.replace(/\/+$/u, ""),
    );

export const attendancePolicyFormSchema =
  z.object({
    defaultBranchId:
      z.coerce
        .number()
        .int()
        .positive(
          "Select an active default branch.",
        ),

    allowWebTimeIn:
      z.boolean(),

    allowManualTimeIn:
      z.boolean(),

    requirePhoto:
      z.boolean(),

    requireLocation:
      z.boolean(),

    photoDirectory:
      relativeDirectorySchema,

    maxPhotoSizeMb:
      z.coerce
        .number()
        .int()
        .min(
          1,
          "Maximum photo size must be at least 1 MB.",
        )
        .max(
          25,
          "Maximum photo size cannot exceed 25 MB.",
        ),

    lateGraceMinutes:
      z.coerce
        .number()
        .int()
        .min(
          0,
          "Late grace cannot be negative.",
        )
        .max(
          180,
          "Late grace cannot exceed 180 minutes.",
        ),

    autoMarkMissingTimeout:
      z.boolean(),

    missingTimeoutMinutes:
      z.coerce
        .number()
        .int()
        .min(
          60,
          "Missing time-out threshold must be at least 60 minutes.",
        )
        .max(
          2880,
          "Missing time-out threshold cannot exceed 2,880 minutes.",
        ),
  });

export type AttendancePolicyFormParseResult =
  | {
      ok: true;

      data:
        AttendancePolicyFormInput;
    }
  | {
      ok: false;

      fieldErrors: Partial<
        Record<
          AttendancePolicyFormField,
          string[]
        >
      >;
    };

function readString(
  formData: FormData,
  name: string,
): string {
  const value =
    formData.get(name);

  return typeof value === "string"
    ? value
    : "";
}

function readCheckbox(
  formData: FormData,
  name: string,
): boolean {
  const value =
    formData.get(name);

  return (
    value === "on" ||
    value === "true" ||
    value === "1"
  );
}

export function parseAttendancePolicyFormData(
  formData: FormData,
): AttendancePolicyFormParseResult {
  const result =
    attendancePolicyFormSchema.safeParse({
      defaultBranchId:
        readString(
          formData,
          "defaultBranchId",
        ),

      allowWebTimeIn:
        readCheckbox(
          formData,
          "allowWebTimeIn",
        ),

      allowManualTimeIn:
        readCheckbox(
          formData,
          "allowManualTimeIn",
        ),

      requirePhoto:
        readCheckbox(
          formData,
          "requirePhoto",
        ),

      requireLocation:
        readCheckbox(
          formData,
          "requireLocation",
        ),

      photoDirectory:
        readString(
          formData,
          "photoDirectory",
        ),

      maxPhotoSizeMb:
        readString(
          formData,
          "maxPhotoSizeMb",
        ),

      lateGraceMinutes:
        readString(
          formData,
          "lateGraceMinutes",
        ),

      autoMarkMissingTimeout:
        readCheckbox(
          formData,
          "autoMarkMissingTimeout",
        ),

      missingTimeoutMinutes:
        readString(
          formData,
          "missingTimeoutMinutes",
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
      AttendancePolicyFormField,
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
      field as AttendancePolicyFormField;

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

export const INITIAL_ATTENDANCE_POLICY_ACTION_STATE: AttendancePolicyActionState =
  {
    status: "IDLE",

    message: "",

    fieldErrors: {},
  };