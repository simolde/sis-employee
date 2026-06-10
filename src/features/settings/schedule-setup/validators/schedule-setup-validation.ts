import { z } from "zod";

export const scheduleSetupStatusSchema =
  z.enum(
    [
      "ACTIVE",
      "INACTIVE",
      "ARCHIVED",
    ],
    {
      error:
        "Status is required.",
    },
  );

const WEEKDAY_ORDER = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
] as const;

function checkboxToBoolean(
  value: unknown,
): boolean {
  return (
    value === "on" ||
    value === "true" ||
    value === true
  );
}

function emptyToNull(
  value: unknown,
): unknown {
  if (
    value === "" ||
    value === undefined ||
    value === null
  ) {
    return null;
  }

  return value;
}

function normalizeTime(
  value: string,
): string {
  return value
    .trim()
    .slice(0, 5);
}

function timeToMinutes(
  value: string,
): number {
  const [
    hour = "0",
    minute = "0",
  ] = value.split(":");

  return (
    Number(hour) * 60 +
    Number(minute)
  );
}

function getWeekdayTokens(
  value: string,
): string[] {
  return value
    .split(",")
    .map((day) =>
      day
        .trim()
        .toUpperCase(),
    )
    .filter(Boolean);
}

const codeSchema = z
  .string()
  .trim()
  .min(
    1,
    "Code is required.",
  )
  .max(
    50,
    "Code is too long.",
  )
  .regex(
    /^[A-Za-z0-9_-]+$/u,
    "Use letters, numbers, hyphens, or underscores only.",
  )
  .transform((value) =>
    value.toUpperCase(),
  );

const timeSchema = z
  .string()
  .trim()
  .min(
    1,
    "Time is required.",
  )
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/u,
    "Use HH:mm format.",
  )
  .transform(
    normalizeTime,
  );

const optionalDateSchema =
  z.preprocess(
    emptyToNull,
    z.union([
      z.coerce.date(),
      z.null(),
    ]),
  );

const requiredDateSchema =
  z.coerce.date({
    error:
      "Date is required.",
  });

const daysOfWeekSchema =
  z
    .preprocess(
      emptyToNull,

      z
        .string()
        .trim()
        .max(
          50,
          "Days of week is too long.",
        )
        .nullable(),
    )
    .superRefine(
      (
        value,
        context,
      ) => {
        if (!value) {
          return;
        }

        const tokens =
          getWeekdayTokens(
            value,
          );

        const invalidTokens =
          tokens.filter(
            (token) =>
              !WEEKDAY_ORDER.includes(
                token as
                  (typeof WEEKDAY_ORDER)[number],
              ),
          );

        if (
          invalidTokens.length >
          0
        ) {
          context.addIssue({
            code: "custom",

            message:
              `Invalid weekday value(s): ${invalidTokens.join(
                ", ",
              )}. Use MON,TUE,WED,THU,FRI,SAT,SUN.`,
          });
        }

        const uniqueTokens =
          new Set(tokens);

        if (
          uniqueTokens.size !==
          tokens.length
        ) {
          context.addIssue({
            code: "custom",

            message:
              "Duplicate weekdays are not allowed.",
          });
        }
      },
    )
    .transform((value) => {
      if (!value) {
        return null;
      }

      const selectedDays =
        new Set(
          getWeekdayTokens(
            value,
          ),
        );

      return WEEKDAY_ORDER
        .filter((day) =>
          selectedDays.has(day),
        )
        .join(",");
    });

const shiftBaseSchema =
  z.object({
    shiftCode:
      codeSchema,

    name: z
      .string()
      .trim()
      .min(
        1,
        "Shift name is required.",
      )
      .max(
        120,
        "Shift name is too long.",
      ),

    startTime:
      timeSchema,

    endTime:
      timeSchema,

    graceMinutes:
      z.coerce
        .number({
          error:
            "Grace minutes is required.",
        })
        .int()
        .min(
          0,
          "Grace minutes cannot be negative.",
        )
        .max(
          240,
          "Grace minutes is too high.",
        ),

    isOvernight:
      z.preprocess(
        checkboxToBoolean,
        z.boolean(),
      ),
  });

function validateShiftTimes(
  data: {
    startTime: string;
    endTime: string;
    isOvernight: boolean;
  },

  context:
    z.RefinementCtx,
): void {
  const startMinutes =
    timeToMinutes(
      data.startTime,
    );

  const endMinutes =
    timeToMinutes(
      data.endTime,
    );

  if (
    startMinutes ===
    endMinutes
  ) {
    context.addIssue({
      code: "custom",
      path: ["endTime"],

      message:
        "Start and end time cannot be the same.",
    });

    return;
  }

  if (
    !data.isOvernight &&
    endMinutes <
      startMinutes
  ) {
    context.addIssue({
      code: "custom",
      path: ["endTime"],

      message:
        "End time must be later than start time unless Overnight is enabled.",
    });
  }

  if (
    data.isOvernight &&
    endMinutes >
      startMinutes
  ) {
    context.addIssue({
      code: "custom",
      path: [
        "isOvernight",
      ],

      message:
        "Overnight should only be enabled when the shift ends on the following day.",
    });
  }
}

export const createShiftValidationSchema =
  shiftBaseSchema.superRefine(
    validateShiftTimes,
  );

export const updateShiftValidationSchema =
  shiftBaseSchema
    .extend({
      shiftId:
        z.coerce
          .number({
            error:
              "Shift ID is required.",
          })
          .int()
          .positive(
            "Shift ID is required.",
          ),

      status:
        scheduleSetupStatusSchema,
    })
    .superRefine(
      validateShiftTimes,
    );

const scheduleBaseSchema =
  z.object({
    scheduleCode:
      codeSchema,

    name: z
      .string()
      .trim()
      .min(
        1,
        "Schedule name is required.",
      )
      .max(
        120,
        "Schedule name is too long.",
      ),

    shiftId:
      z.coerce
        .number({
          error:
            "Shift is required.",
        })
        .int()
        .positive(
          "Shift is required.",
        ),

    daysOfWeek:
      daysOfWeekSchema,

    effectiveFrom:
      requiredDateSchema,

    effectiveTo:
      optionalDateSchema,
  });

function validateScheduleDates(
  data: {
    effectiveFrom: Date;
    effectiveTo: Date | null;
  },

  context:
    z.RefinementCtx,
): void {
  if (
    data.effectiveTo &&
    data.effectiveTo <
      data.effectiveFrom
  ) {
    context.addIssue({
      code: "custom",
      path: [
        "effectiveTo",
      ],

      message:
        "Effective to must be the same date or later than effective from.",
    });
  }
}

export const createScheduleValidationSchema =
  scheduleBaseSchema.superRefine(
    validateScheduleDates,
  );

export const updateScheduleValidationSchema =
  scheduleBaseSchema
    .extend({
      scheduleId:
        z.coerce
          .number({
            error:
              "Schedule ID is required.",
          })
          .int()
          .positive(
            "Schedule ID is required.",
          ),

      status:
        scheduleSetupStatusSchema,
    })
    .superRefine(
      validateScheduleDates,
    );