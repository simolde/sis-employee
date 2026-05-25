import { z } from "zod";

export const loginValidationSchema = z.object({
  login: z
    .string()
    .trim()
    .min(1, "Username or email is required.")
    .max(191, "Username or email is too long."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(255, "Password is too long."),
});

export type LoginInput = z.infer<typeof loginValidationSchema>;