import { z } from "zod";
import {
  BRANCH_STATUSES,
  type BranchFormActionState,
  type BranchFormField,
  type BranchFormInput,
} from "../types/branch-management-types";

const nullableTextSchema =
  z
    .string()
    .trim()
    .max(
      65_535,
      "Address cannot exceed 65,535 characters.",
    )
    .transform(
      (value) =>
        value.length > 0
          ? value
          : null,
    );

const optionalLatitudeSchema =
  z.preprocess(
    (value) => {
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return null;
      }

      return value;
    },
    z
      .coerce
      .number()
      .min(
        -90,
        "Latitude cannot be below -90.",
      )
      .max(
        90,
        "Latitude cannot exceed 90.",
      )
      .nullable(),
  );

const optionalLongitudeSchema =
  z.preprocess(
    (value) => {
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return null;
      }

      return value;
    },
    z
      .coerce
      .number()
      .min(
        -180,
        "Longitude cannot be below -180.",
      )
      .max(
        180,
        "Longitude cannot exceed 180.",
      )
      .nullable(),
  );

const optionalRadiusSchema =
  z.preprocess(
    (value) => {
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return null;
      }

      return value;
    },
    z
      .coerce
      .number()
      .int(
        "Geofence radius must be a whole number.",
      )
      .min(
        1,
        "Geofence radius must be at least 1 meter.",
      )
      .max(
        100_000,
        "Geofence radius cannot exceed 100,000 meters.",
      )
      .nullable(),
  );

export const branchFormSchema =
  z
    .object({
      branchCode:
        z
          .string()
          .trim()
          .min(
            1,
            "Branch code is required.",
          )
          .max(
            50,
            "Branch code cannot exceed 50 characters.",
          )
          .regex(
            /^[A-Za-z0-9_-]+$/,
            "Branch code may contain letters, numbers, underscores, and hyphens only.",
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
            "Branch name must contain at least 2 characters.",
          )
          .max(
            191,
            "Branch name cannot exceed 191 characters.",
          ),

      address:
        nullableTextSchema,

      latitude:
        optionalLatitudeSchema,

      longitude:
        optionalLongitudeSchema,

      radiusM:
        optionalRadiusSchema,

      status:
        z.enum(
          BRANCH_STATUSES,
        ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        const hasLatitude =
          value.latitude !== null;

        const hasLongitude =
          value.longitude !== null;

        if (
          hasLatitude !==
          hasLongitude
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              hasLatitude
                ? "longitude"
                : "latitude",
            ],

            message:
              "Latitude and longitude must be provided together.",
          });
        }

        if (
          value.radiusM !== null &&
          (
            value.latitude === null ||
            value.longitude === null
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "radiusM",
            ],

            message:
              "Latitude and longitude are required when a geofence radius is configured.",
          });
        }
      },
    );

export const branchStatusChangeSchema =
  z.object({
    branchId:
      z
        .coerce
        .number()
        .int()
        .positive(),

    status:
      z.enum(
        BRANCH_STATUSES,
      ),
  });

export const branchDeleteSchema =
  z.object({
    branchId:
      z
        .coerce
        .number()
        .int()
        .positive(),
  });

export type BranchFormParseResult =
  | {
      ok: true;
      data: BranchFormInput;
    }
  | {
      ok: false;

      fieldErrors: Partial<
        Record<
          BranchFormField,
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

  return typeof value ===
    "string"
    ? value
    : "";
}

export function parseBranchFormData(
  formData: FormData,
): BranchFormParseResult {
  const result =
    branchFormSchema.safeParse({
      branchCode:
        readFormString(
          formData,
          "branchCode",
        ),

      name:
        readFormString(
          formData,
          "name",
        ),

      address:
        readFormString(
          formData,
          "address",
        ),

      latitude:
        readFormString(
          formData,
          "latitude",
        ),

      longitude:
        readFormString(
          formData,
          "longitude",
        ),

      radiusM:
        readFormString(
          formData,
          "radiusM",
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
      BranchFormField,
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
      typeof field !==
      "string"
    ) {
      continue;
    }

    const typedField =
      field as BranchFormField;

    fieldErrors[
      typedField
    ] = [
      ...(
        fieldErrors[
          typedField
        ] ?? []
      ),
      issue.message,
    ];
  }

  return {
    ok: false,
    fieldErrors,
  };
}

export const INITIAL_BRANCH_FORM_ACTION_STATE: BranchFormActionState =
  {
    status: "IDLE",

    message: "",

    fieldErrors: {},

    branchId: null,
  };