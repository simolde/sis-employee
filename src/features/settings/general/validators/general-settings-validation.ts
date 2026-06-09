import { z } from "zod";
import {
  GENERAL_SETTINGS_DATE_FORMATS,
  GENERAL_SETTINGS_LOCALES,
  GENERAL_SETTINGS_PAGE_SIZES,
  GENERAL_SETTINGS_TIME_FORMATS,
  GENERAL_SETTINGS_TIME_ZONES,
  GENERAL_SETTINGS_WEEK_STARTS,
  type GeneralApplicationSettings,
} from "../types/general-settings-types";

export const generalApplicationSettingsSchema =
  z.object({
    applicationName:
      z
        .string()
        .trim()
        .min(
          2,
          "Application name must contain at least 2 characters.",
        )
        .max(
          100,
          "Application name cannot exceed 100 characters.",
        ),

    schoolName:
      z
        .string()
        .trim()
        .min(
          2,
          "School name must contain at least 2 characters.",
        )
        .max(
          150,
          "School name cannot exceed 150 characters.",
        ),

    schoolShortName:
      z
        .string()
        .trim()
        .min(
          2,
          "School short name must contain at least 2 characters.",
        )
        .max(
          30,
          "School short name cannot exceed 30 characters.",
        ),

    timeZone:
      z.enum(
        GENERAL_SETTINGS_TIME_ZONES,
      ),

    locale:
      z.enum(
        GENERAL_SETTINGS_LOCALES,
      ),

    dateFormat:
      z.enum(
        GENERAL_SETTINGS_DATE_FORMATS,
      ),

    timeFormat:
      z.enum(
        GENERAL_SETTINGS_TIME_FORMATS,
      ),

    weekStartsOn:
      z.enum(
        GENERAL_SETTINGS_WEEK_STARTS,
      ),

    defaultPageSize:
      z
        .coerce
        .number()
        .int()
        .refine(
          (
            value,
          ): value is GeneralApplicationSettings["defaultPageSize"] =>
            GENERAL_SETTINGS_PAGE_SIZES.some(
              (pageSize) =>
                pageSize === value,
            ),
          {
            message:
              "Default page size must be 10, 25, 50, or 100.",
          },
        ),
  });

export type GeneralApplicationSettingsInput =
  z.infer<
    typeof generalApplicationSettingsSchema
  >;

export type GeneralApplicationSettingsParseResult =
  | {
      ok: true;

      data:
        GeneralApplicationSettings;
    }
  | {
      ok: false;

      fieldErrors: Partial<
        Record<
          keyof GeneralApplicationSettings,
          string[]
        >
      >;
    };

function formDataString(
  formData: FormData,
  name: string,
): string {
  const value =
    formData.get(name);

  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

export function parseGeneralApplicationSettingsFormData(
  formData: FormData,
): GeneralApplicationSettingsParseResult {
  const result =
    generalApplicationSettingsSchema.safeParse(
      {
        applicationName:
          formDataString(
            formData,
            "applicationName",
          ),

        schoolName:
          formDataString(
            formData,
            "schoolName",
          ),

        schoolShortName:
          formDataString(
            formData,
            "schoolShortName",
          ),

        timeZone:
          formDataString(
            formData,
            "timeZone",
          ),

        locale:
          formDataString(
            formData,
            "locale",
          ),

        dateFormat:
          formDataString(
            formData,
            "dateFormat",
          ),

        timeFormat:
          formDataString(
            formData,
            "timeFormat",
          ),

        weekStartsOn:
          formDataString(
            formData,
            "weekStartsOn",
          ),

        defaultPageSize:
          formDataString(
            formData,
            "defaultPageSize",
          ),
      },
    );

  if (result.success) {
    return {
      ok: true,

      data:
        result.data,
    };
  }

  const fieldErrors: Partial<
    Record<
      keyof GeneralApplicationSettings,
      string[]
    >
  > = {};

  for (
    const issue of
    result.error.issues
  ) {
    const field =
      issue.path[0];

    if (
      typeof field !==
      "string"
    ) {
      continue;
    }

    const typedField =
      field as keyof GeneralApplicationSettings;

    const existingErrors =
      fieldErrors[
        typedField
      ] ?? [];

    fieldErrors[
      typedField
    ] = [
      ...existingErrors,
      issue.message,
    ];
  }

  return {
    ok: false,
    fieldErrors,
  };
}