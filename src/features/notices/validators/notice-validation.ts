import { z } from "zod";
import { noticeAudienceValues } from "../types/notice-types";

function checkboxToBoolean(value: unknown): boolean {
  return value === "on" || value === "true" || value === true;
}

function emptyToNull(value: unknown): unknown {
  if (value === "" || value === undefined) {
    return null;
  }

  return value;
}

const optionalPositiveIdSchema = z.preprocess(
  emptyToNull,
  z.union([z.coerce.number().int().positive(), z.null()]),
);

const optionalDateSchema = z.preprocess(
  emptyToNull,
  z.union([z.coerce.date(), z.null()]),
);

export const createNoticeValidationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(191, "Title is too long."),

  body: z
    .string()
    .trim()
    .min(1, "Notice body is required.")
    .max(5000, "Notice body is too long."),

  audience: z.enum(noticeAudienceValues, {
    error: "Audience is required.",
  }),

  branchId: optionalPositiveIdSchema,

  departmentId: optionalPositiveIdSchema,

  expiresAt: optionalDateSchema,

  publishNow: z.preprocess(checkboxToBoolean, z.boolean()),
});