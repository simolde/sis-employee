import { z } from "zod";

export const scheduleSetupStatusSchema = z.enum(
  ["ACTIVE", "INACTIVE", "ARCHIVED"],
  {
    error: "Status is required.",
  },
);

function checkboxToBoolean(value: unknown): boolean {
  return value === "on" || value === "true" || value === true;
}

function emptyToNull(value: unknown): unknown {
  if (value === "" || value === undefined) {
    return null;
  }

  return value;
}

function normalizeTime(value: string): string {
  const trimmedValue = value.trim();

  if (/^\d{2}:\d{2}$/.test(trimmedValue)) {
    return `${trimmedValue}:00`;
  }

  return trimmedValue;
}

const codeSchema = z
  .string()
  .trim()
  .min(1, "Code is required.")
  .max(50, "Code is too long.")
  .transform((value) => value.toUpperCase());

const timeSchema = z
  .string()
  .trim()
  .min(1, "Time is required.")
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Use HH:mm format.")
  .transform(normalizeTime);

const optionalDateSchema = z.preprocess(
  emptyToNull,
  z.union([z.coerce.date(), z.null()]),
);

const requiredDateSchema = z.coerce.date({
  error: "Date is required.",
});

const daysOfWeekSchema = z
  .string()
  .trim()
  .max(50, "Days of week is too long.")
  .optional()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value
      .split(",")
      .map((day) => day.trim().toUpperCase())
      .filter(Boolean)
      .join(",");
  });

export const createShiftValidationSchema = z.object({
  shiftCode: codeSchema,

  name: z
    .string()
    .trim()
    .min(1, "Shift name is required.")
    .max(120, "Shift name is too long."),

  startTime: timeSchema,

  endTime: timeSchema,

  graceMinutes: z.coerce
    .number({
      error: "Grace minutes is required.",
    })
    .int()
    .min(0, "Grace minutes cannot be negative.")
    .max(240, "Grace minutes is too high."),

  isOvernight: z.preprocess(checkboxToBoolean, z.boolean()),
});

export const updateShiftValidationSchema = createShiftValidationSchema.extend({
  shiftId: z.coerce
    .number({
      error: "Shift ID is required.",
    })
    .int()
    .positive("Shift ID is required."),

  status: scheduleSetupStatusSchema,
});

export const createScheduleValidationSchema = z
  .object({
    scheduleCode: codeSchema,

    name: z
      .string()
      .trim()
      .min(1, "Schedule name is required.")
      .max(120, "Schedule name is too long."),

    shiftId: z.coerce
      .number({
        error: "Shift is required.",
      })
      .int()
      .positive("Shift is required."),

    daysOfWeek: daysOfWeekSchema,

    effectiveFrom: requiredDateSchema,

    effectiveTo: optionalDateSchema,
  })
  .refine(
    (data) => {
      if (!data.effectiveTo) {
        return true;
      }

      return data.effectiveTo >= data.effectiveFrom;
    },
    {
      path: ["effectiveTo"],
      message: "Effective to must be the same date or later than effective from.",
    },
  );

export const updateScheduleValidationSchema =
  createScheduleValidationSchema.extend({
    scheduleId: z.coerce
      .number({
        error: "Schedule ID is required.",
      })
      .int()
      .positive("Schedule ID is required."),

    status: scheduleSetupStatusSchema,
  });