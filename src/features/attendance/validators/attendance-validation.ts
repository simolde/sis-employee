import {
  z,
} from "zod";
import {
  isAttendancePhotoPathAllowed,
} from "@/features/attendance/policies/server/attendance-evidence-policy";

export type OdlAttendanceValidationOptions = {
  requirePhoto: boolean;
  requireLocation: boolean;
  photoDirectory: string;
};

function emptyToNull(
  value: unknown,
): unknown {
  if (
    value === "" ||
    value === undefined ||
    value === null
  ) {
    return null;
  }

  return value;
}

function coordinateSchema(input: {
  minimum: number;
  maximum: number;
  label: string;
}) {
  return z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .regex(
        /^-?\d+(\.\d+)?$/u,
        `Enter a valid ${input.label.toLowerCase()}.`,
      )
      .refine(
        (value) => {
          const converted =
            Number(value);

          return (
            Number.isFinite(
              converted,
            ) &&
            converted >=
              input.minimum &&
            converted <=
              input.maximum
          );
        },
        `${input.label} is outside the valid range.`,
      )
      .nullable(),
  );
}

const latitudeSchema =
  coordinateSchema({
    minimum: -90,
    maximum: 90,
    label: "Latitude",
  });

const longitudeSchema =
  coordinateSchema({
    minimum: -180,
    maximum: 180,
    label: "Longitude",
  });

const optionalLongTextSchema =
  z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(
        1000,
        "This field is too long.",
      )
      .nullable(),
  );

const optionalPhotoPathSchema =
  z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(
        255,
        "Photo path is too long.",
      )
      .nullable(),
  );

export function createOdlAttendanceValidationSchema(
  options:
    OdlAttendanceValidationOptions,
) {
  return z
    .object({
      latitude:
        latitudeSchema,

      longitude:
        longitudeSchema,

      address:
        optionalLongTextSchema,

      photoPath:
        optionalPhotoPathSchema,

      remarks:
        optionalLongTextSchema,

      reason:
        optionalLongTextSchema,
    })
    .superRefine(
      (
        data,
        context,
      ) => {
        if (
          options.requireLocation
        ) {
          if (!data.latitude) {
            context.addIssue({
              code:
                "custom",

              path: [
                "latitude",
              ],

              message:
                "GPS latitude is required.",
            });
          }

          if (!data.longitude) {
            context.addIssue({
              code:
                "custom",

              path: [
                "longitude",
              ],

              message:
                "GPS longitude is required.",
            });
          }

          if (!data.address) {
            context.addIssue({
              code:
                "custom",

              path: [
                "address",
              ],

              message:
                "Full address is required.",
            });
          }
        }

        if (
          options.requirePhoto &&
          !data.photoPath
        ) {
          context.addIssue({
            code: "custom",

            path: [
              "photoPath",
            ],

            message:
              "Selfie photo is required.",
          });
        }

        if (
          data.photoPath &&
          !isAttendancePhotoPathAllowed(
            data.photoPath,
            options.photoDirectory,
          )
        ) {
          context.addIssue({
            code: "custom",

            path: [
              "photoPath",
            ],

            message:
              "The attendance photo path is invalid or was not created by the configured upload service.",
          });
        }
      },
    );
}

export type OdlAttendanceInput =
  z.infer<
    ReturnType<
      typeof createOdlAttendanceValidationSchema
    >
  >;