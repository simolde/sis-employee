import {
  z,
} from "zod";

function checkboxToBoolean(
  value: unknown,
): boolean {
  return (
    value === "on" ||
    value === "true" ||
    value === true
  );
}

function emptyToDefaultLimit(
  value: unknown,
): unknown {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 500;
  }

  return value;
}

function parseDateInput(
  value: string,
): Date {
  return new Date(
    `${value}T00:00:00.000Z`,
  );
}

const dateInputSchema =
  z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/u,
      "Use a valid effective date.",
    )
    .transform(
      parseDateInput,
    )
    .refine(
      (value) =>
        !Number.isNaN(
          value.getTime(),
        ),
      "Use a valid effective date.",
    );

export const bulkScheduleAssignmentValidationSchema =
  z.object({
    targetScheduleId:
      z.coerce
        .number({
          error:
            "Target schedule is required.",
        })
        .int()
        .positive(
          "Target schedule is required.",
        ),

    validFrom:
      dateInputSchema,

    remarks:
      z
        .string()
        .trim()
        .max(
          1000,
          "Remarks are too long.",
        )
        .default(""),

    limit:
      z.preprocess(
        emptyToDefaultLimit,
        z.coerce
          .number()
          .int()
          .min(
            1,
            "Limit must be at least 1.",
          )
          .max(
            500,
            "Limit cannot exceed 500.",
          ),
      ),

    confirmAll:
      z.preprocess(
        checkboxToBoolean,
        z.boolean(),
      ),
  });

export type BulkScheduleAssignmentInput =
  z.infer<
    typeof bulkScheduleAssignmentValidationSchema
  >;