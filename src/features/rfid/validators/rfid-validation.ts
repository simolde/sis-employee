import { z } from "zod";

export const assignRfidValidationSchema = z.object({
  empId: z.coerce
    .number({
      error: "Employee is required.",
    })
    .int()
    .positive("Employee is required."),

  rfidUid: z
    .string()
    .trim()
    .min(1, "RFID UID is required.")
    .max(191, "RFID UID is too long.")
    .transform((value) => value.toUpperCase()),

  remarks: z
    .string()
    .trim()
    .max(1000, "Remarks is too long.")
    .optional()
    .transform((value) => (value ? value : null)),
});

export type AssignRfidInput = z.infer<typeof assignRfidValidationSchema>;