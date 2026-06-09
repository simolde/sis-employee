export const GENERAL_SETTINGS_TIME_ZONES = [
  "Asia/Manila",
  "Asia/Singapore",
  "UTC",
] as const;

export const GENERAL_SETTINGS_LOCALES = [
  "en-PH",
  "en-US",
] as const;

export const GENERAL_SETTINGS_DATE_FORMATS = [
  "MMMM d, yyyy",
  "MMM d, yyyy",
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "yyyy-MM-dd",
] as const;

export const GENERAL_SETTINGS_TIME_FORMATS = [
  "12_HOUR",
  "24_HOUR",
] as const;

export const GENERAL_SETTINGS_WEEK_STARTS = [
  "MONDAY",
  "SUNDAY",
] as const;

export const GENERAL_SETTINGS_PAGE_SIZES = [
  10,
  25,
  50,
  100,
] as const;

export type GeneralSettingsTimeZone =
  (typeof GENERAL_SETTINGS_TIME_ZONES)[number];

export type GeneralSettingsLocale =
  (typeof GENERAL_SETTINGS_LOCALES)[number];

export type GeneralSettingsDateFormat =
  (typeof GENERAL_SETTINGS_DATE_FORMATS)[number];

export type GeneralSettingsTimeFormat =
  (typeof GENERAL_SETTINGS_TIME_FORMATS)[number];

export type GeneralSettingsWeekStartsOn =
  (typeof GENERAL_SETTINGS_WEEK_STARTS)[number];

export type GeneralSettingsPageSize =
  (typeof GENERAL_SETTINGS_PAGE_SIZES)[number];

export type GeneralApplicationSettings = {
  applicationName: string;

  schoolName: string;
  schoolShortName: string;

  timeZone:
    GeneralSettingsTimeZone;

  locale:
    GeneralSettingsLocale;

  dateFormat:
    GeneralSettingsDateFormat;

  timeFormat:
    GeneralSettingsTimeFormat;

  weekStartsOn:
    GeneralSettingsWeekStartsOn;

  defaultPageSize:
    GeneralSettingsPageSize;
};

export type GeneralApplicationSettingsSource =
  | "ACTIVITY_LOG"
  | "ENVIRONMENT_DEFAULTS";

export type GeneralApplicationSettingsData = {
  settings:
    GeneralApplicationSettings;

  source:
    GeneralApplicationSettingsSource;

  latestActivityLogId:
    number | null;

  updatedAt: string | null;
  updatedAtIso: string | null;
};

export type GeneralSettingsActionStatus =
  | "IDLE"
  | "SUCCESS"
  | "ERROR";

export type GeneralSettingsActionState = {
  status:
    GeneralSettingsActionStatus;

  message: string;

  fieldErrors: Partial<
    Record<
      keyof GeneralApplicationSettings,
      string[]
    >
  >;

  savedActivityLogId:
    number | null;
};