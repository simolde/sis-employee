import { z } from "zod";
import {
  attendanceReviewModeValues,
  attendanceReviewStatusValues,
} from "../types/attendance-review-action-state";

export const attendanceReviewValidationSchema = z.object({
  status: z.enum(attendanceReviewStatusValues, {
    error: "Attendance status is required.",
  }),

  reviewMode: z.enum(attendanceReviewModeValues, {
    error: "Review action is required.",
  }),

  reviewNote: z
    .string()
    .trim()
    .max(500, "Review note is too long.")
    .optional()
    .transform((value) => {
      if (!value) {
        return null;
      }

      return value;
    }),
});