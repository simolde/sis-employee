import { z } from "zod";

function checkboxToBoolean(value: unknown): boolean {
  return value === "on" || value === "true" || value === true;
}

export const createLeaveTypeValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Leave type name is required.")
    .max(100, "Leave type name is too long."),

  code: z
    .string()
    .trim()
    .min(1, "Leave type code is required.")
    .max(30, "Leave type code is too long.")
    .transform((value) => value.toUpperCase()),

  isPaid: z.preprocess(checkboxToBoolean, z.boolean()),

  requiresAttachment: z.preprocess(checkboxToBoolean, z.boolean()),
});

export const updateLeaveTypeValidationSchema =
  createLeaveTypeValidationSchema.extend({
    leaveTypeId: z.coerce
      .number({
        error: "Leave type ID is required.",
      })
      .int()
      .positive("Leave type ID is required."),

    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"], {
      error: "Status is required.",
    }),
  });

export type CreateLeaveTypeInput = z.infer<
  typeof createLeaveTypeValidationSchema
>;

export type UpdateLeaveTypeInput = z.infer<
  typeof updateLeaveTypeValidationSchema
>;