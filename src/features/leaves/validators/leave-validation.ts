import { z } from "zod";
import { leaveStatusValues } from "../types/leave-types";

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "This date is required.")
  .pipe(z.coerce.date());

export const createLeaveRequestValidationSchema = z
  .object({
    leaveTypeId: z.coerce
      .number({
        error: "Leave type is required.",
      })
      .int()
      .positive("Leave type is required."),

    dateFrom: requiredDateSchema,
    dateTo: requiredDateSchema,

    reason: z
      .string()
      .trim()
      .min(1, "Reason is required.")
      .max(1000, "Reason is too long."),
  })
  .superRefine((data, context) => {
    if (data.dateTo < data.dateFrom) {
      context.addIssue({
        code: "custom",
        path: ["dateTo"],
        message: "Date to cannot be earlier than date from.",
      });
    }
  });

export const rejectLeaveValidationSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required.")
    .max(1000, "Rejection reason is too long."),
});

export const leaveListSearchParamsSchema = z.object({
  status: z.enum(["ALL", ...leaveStatusValues]).catch("ALL"),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(5).max(50).catch(10),
});

export type CreateLeaveRequestInput = z.infer<
  typeof createLeaveRequestValidationSchema
>;

export type RejectLeaveInput = z.infer<typeof rejectLeaveValidationSchema>;