import { z } from "zod";

export const createEmployeeAccountValidationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(191, "Username is too long."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(191, "Email is too long."),

  roleId: z.coerce
    .number({
      error: "Role is required.",
    })
    .int()
    .positive("Role is required."),

  temporaryPassword: z
    .string()
    .min(8, "Temporary password must be at least 8 characters.")
    .max(255, "Temporary password is too long."),
});

export const resetEmployeePasswordValidationSchema = z.object({
  temporaryPassword: z
    .string()
    .min(8, "Temporary password must be at least 8 characters.")
    .max(255, "Temporary password is too long."),
});

export type CreateEmployeeAccountInput = z.infer<
  typeof createEmployeeAccountValidationSchema
>;

export type ResetEmployeePasswordInput = z.infer<
  typeof resetEmployeePasswordValidationSchema
>;