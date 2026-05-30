import { z } from "zod";

export const employmentSetupStatusSchema = z.enum(
  ["ACTIVE", "INACTIVE", "ARCHIVED"],
  {
    error: "Status is required.",
  },
);

const codeSchema = z
  .string()
  .trim()
  .min(1, "Code is required.")
  .max(50, "Code is too long.")
  .transform((value) => value.toUpperCase());

export const createDesignationValidationSchema = z.object({
  designationCode: codeSchema,

  name: z
    .string()
    .trim()
    .min(1, "Designation name is required.")
    .max(191, "Designation name is too long."),
});

export const updateDesignationValidationSchema =
  createDesignationValidationSchema.extend({
    designationId: z.coerce
      .number({
        error: "Designation ID is required.",
      })
      .int()
      .positive("Designation ID is required."),

    status: employmentSetupStatusSchema,
  });

export const createEmployeeTypeValidationSchema = z.object({
  empTypeCode: codeSchema,

  name: z
    .string()
    .trim()
    .min(1, "Employee type name is required.")
    .max(191, "Employee type name is too long."),
});

export const updateEmployeeTypeValidationSchema =
  createEmployeeTypeValidationSchema.extend({
    empTypeId: z.coerce
      .number({
        error: "Employee type ID is required.",
      })
      .int()
      .positive("Employee type ID is required."),

    status: employmentSetupStatusSchema,
  });