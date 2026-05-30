import { z } from "zod";

export const organizationStatusSchema = z.enum(
  ["ACTIVE", "INACTIVE", "ARCHIVED"],
  {
    error: "Status is required.",
  },
);

export const createBranchValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Branch name is required.")
    .max(191, "Branch name is too long."),
});

export const updateBranchValidationSchema = createBranchValidationSchema.extend({
  branchId: z.coerce
    .number({
      error: "Branch ID is required.",
    })
    .int()
    .positive("Branch ID is required."),
  status: organizationStatusSchema,
});

export const createDepartmentValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Department name is required.")
    .max(191, "Department name is too long."),
});

export const updateDepartmentValidationSchema =
  createDepartmentValidationSchema.extend({
    departmentId: z.coerce
      .number({
        error: "Department ID is required.",
      })
      .int()
      .positive("Department ID is required."),
    status: organizationStatusSchema,
  });