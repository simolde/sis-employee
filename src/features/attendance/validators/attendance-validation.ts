import { z } from "zod";

function emptyToNull(value: unknown): unknown {
  if (value === "" || value === undefined) {
    return null;
  }

  return value;
}

const requiredCoordinateSchema = z
  .string()
  .trim()
  .min(1, "GPS location is required.")
  .regex(/^-?\d+(\.\d+)?$/, "Enter a valid coordinate.");

const optionalTextSchema = z.preprocess(
  emptyToNull,
  z.string().trim().max(1000, "This field is too long.").nullable(),
);

export const manualAttendanceValidationSchema = z.object({
  empId: z.coerce
    .number({
      error: "Employee is required.",
    })
    .int()
    .positive("Employee is required."),

  branchId: z.coerce
    .number({
      error: "Branch is required.",
    })
    .int()
    .positive("Branch is required."),

  punchType: z.enum(["TIME_IN", "TIME_OUT"], {
    error: "Punch type is required.",
  }),

  latitude: requiredCoordinateSchema,
  longitude: requiredCoordinateSchema,

  address: z
    .string()
    .trim()
    .min(1, "Full address is required.")
    .max(1000, "Address is too long."),

  photoPath: z
    .string()
    .trim()
    .min(1, "Selfie photo is required.")
    .max(255, "Photo path is too long."),

  remarks: optionalTextSchema,
  reason: optionalTextSchema,
});

export type ManualAttendanceInput = z.infer<
  typeof manualAttendanceValidationSchema
>;