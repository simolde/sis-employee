import { z } from "zod";

function emptyToNull(value: unknown): unknown {
  if (value === "" || value === undefined) {
    return null;
  }

  return value;
}

const dateOnlySchema = z
  .string()
  .trim()
  .min(1, "Attendance date is required.")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

const dateTimeLocalSchema = z
  .string()
  .trim()
  .min(1, "Time in is required.")
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    "Use a valid date and time.",
  );

const optionalDateTimeLocalSchema = z.preprocess(
  emptyToNull,
  z.union([
    z
      .string()
      .trim()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Use a valid date and time.",
      ),
    z.null(),
  ]),
);

export const manualAttendanceValidationSchema = z
  .object({
    empId: z.coerce
      .number({
        error: "Employee is required.",
      })
      .int()
      .positive("Employee is required."),

    attDate: dateOnlySchema,

    timeIn: dateTimeLocalSchema,

    timeOut: optionalDateTimeLocalSchema,

    remarks: z
      .string()
      .trim()
      .min(1, "Remarks are required for manual attendance.")
      .max(500, "Remarks are too long."),

    reason: z
      .string()
      .trim()
      .min(1, "Reason is required for manual attendance.")
      .max(500, "Reason is too long."),

    address: z
      .string()
      .trim()
      .max(500, "Address is too long.")
      .optional()
      .transform((value) => {
        if (!value) {
          return null;
        }

        return value;
      }),
  })
  .refine(
    (data) => {
      if (!data.timeOut) {
        return true;
      }

      return data.timeOut >= data.timeIn;
    },
    {
      path: ["timeOut"],
      message:
        "Time out must be later than time in. For overnight duty, select the next date for time out.",
    },
  );

export type ManualAttendanceInput = z.infer<
  typeof manualAttendanceValidationSchema
>;