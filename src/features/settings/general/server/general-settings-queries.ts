import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  GENERAL_SETTINGS_DATE_FORMATS,
  GENERAL_SETTINGS_LOCALES,
  GENERAL_SETTINGS_PAGE_SIZES,
  GENERAL_SETTINGS_TIME_FORMATS,
  GENERAL_SETTINGS_TIME_ZONES,
  GENERAL_SETTINGS_WEEK_STARTS,
  type GeneralApplicationSettings,
  type GeneralApplicationSettingsData,
} from "../types/general-settings-types";
import { generalApplicationSettingsSchema } from "../validators/general-settings-validation";

export const GENERAL_SETTINGS_ACTIVITY_ACTION =
  "GENERAL_APPLICATION_SETTINGS_UPDATED_V1";

export const GENERAL_SETTINGS_ACTIVITY_ENTITY_TYPE =
  "system_settings";

export const GENERAL_SETTINGS_ACTIVITY_ENTITY_ID =
  "general_application";

const persistedGeneralSettingsSchema =
  z.object({
    version:
      z.literal(1),

    settings:
      generalApplicationSettingsSchema,

    updatedAt:
      z.string().datetime(),

    fingerprint:
      z.string().min(1).optional(),
  });

function formatDateTime(
  value: Date,
): string {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone:
        "Asia/Manila",
    },
  ).format(value);
}

function environmentString(
  value:
    | string
    | undefined,
  fallback: string,
): string {
  const normalized =
    value?.trim();

  return normalized ||
    fallback;
}

function environmentChoice<
  const TOptions extends readonly string[],
>(
  value:
    | string
    | undefined,

  options:
    TOptions,

  fallback:
    TOptions[number],
): TOptions[number] {
  const normalized =
    value?.trim();

  if (
    normalized &&
    options.includes(
      normalized,
    )
  ) {
    return normalized as
      TOptions[number];
  }

  return fallback;
}

function environmentPageSize(
  value:
    | string
    | undefined,
): GeneralApplicationSettings["defaultPageSize"] {
  const parsed =
    Number(value);

  const matchingPageSize =
    GENERAL_SETTINGS_PAGE_SIZES.find(
      (pageSize) =>
        pageSize === parsed,
    );

  return matchingPageSize ??
    25;
}

export function getDefaultGeneralApplicationSettings(): GeneralApplicationSettings {
  return {
    applicationName:
      environmentString(
        process.env
          .NEXT_PUBLIC_APP_NAME,

        "Starland Employee Attendance System",
      ),

    schoolName:
      environmentString(
        process.env
          .NEXT_PUBLIC_SCHOOL_NAME,

        "Starland International School, Inc.",
      ),

    schoolShortName:
      environmentString(
        process.env
          .NEXT_PUBLIC_SCHOOL_SHORT_NAME,

        "Starland",
      ),

    timeZone:
      environmentChoice(
        process.env.APP_TIME_ZONE,

        GENERAL_SETTINGS_TIME_ZONES,

        "Asia/Manila",
      ),

    locale:
      environmentChoice(
        process.env.APP_LOCALE,

        GENERAL_SETTINGS_LOCALES,

        "en-PH",
      ),

    dateFormat:
      environmentChoice(
        process.env.APP_DATE_FORMAT,

        GENERAL_SETTINGS_DATE_FORMATS,

        "MMMM d, yyyy",
      ),

    timeFormat:
      environmentChoice(
        process.env.APP_TIME_FORMAT,

        GENERAL_SETTINGS_TIME_FORMATS,

        "12_HOUR",
      ),

    weekStartsOn:
      environmentChoice(
        process.env
          .APP_WEEK_STARTS_ON,

        GENERAL_SETTINGS_WEEK_STARTS,

        "MONDAY",
      ),

    defaultPageSize:
      environmentPageSize(
        process.env
          .APP_DEFAULT_PAGE_SIZE,
      ),
  };
}

export async function getGeneralApplicationSettingsData(): Promise<GeneralApplicationSettingsData> {
  const defaultSettings =
    getDefaultGeneralApplicationSettings();

  const activityLog =
    await prisma.activityLog.findFirst(
      {
        where: {
          action:
            GENERAL_SETTINGS_ACTIVITY_ACTION,

          entityType:
            GENERAL_SETTINGS_ACTIVITY_ENTITY_TYPE,

          entityId:
            GENERAL_SETTINGS_ACTIVITY_ENTITY_ID,
        },

        select: {
          activityLogId:
            true,

          newValue:
            true,

          createdAt:
            true,
        },

        orderBy: [
          {
            createdAt:
              "desc",
          },
          {
            activityLogId:
              "desc",
          },
        ],
      },
    );

  if (!activityLog) {
    return {
      settings:
        defaultSettings,

      source:
        "ENVIRONMENT_DEFAULTS",

      latestActivityLogId:
        null,

      updatedAt:
        null,

      updatedAtIso:
        null,
    };
  }

  const parsed =
    persistedGeneralSettingsSchema.safeParse(
      activityLog.newValue,
    );

  if (!parsed.success) {
    return {
      settings:
        defaultSettings,

      source:
        "ENVIRONMENT_DEFAULTS",

      latestActivityLogId:
        null,

      updatedAt:
        null,

      updatedAtIso:
        null,
    };
  }

  const updatedAt =
    new Date(
      parsed.data.updatedAt,
    );

  const validUpdatedAt =
    Number.isNaN(
      updatedAt.getTime(),
    )
      ? activityLog.createdAt
      : updatedAt;

  return {
    settings:
      parsed.data.settings,

    source:
      "ACTIVITY_LOG",

    latestActivityLogId:
      activityLog.activityLogId,

    updatedAt:
      formatDateTime(
        validUpdatedAt,
      ),

    updatedAtIso:
      validUpdatedAt.toISOString(),
  };
}