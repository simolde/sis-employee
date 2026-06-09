"use client";

import {
  useActionState,
} from "react";
import {
  Building2,
  CalendarDays,
  Clock3,
  Globe2,
  LayoutList,
  Save,
  Settings2,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { saveGeneralApplicationSettingsAction } from "../server/general-settings-actions";
import {
  GENERAL_SETTINGS_DATE_FORMATS,
  GENERAL_SETTINGS_LOCALES,
  GENERAL_SETTINGS_PAGE_SIZES,
  GENERAL_SETTINGS_TIME_FORMATS,
  GENERAL_SETTINGS_TIME_ZONES,
  GENERAL_SETTINGS_WEEK_STARTS,
  type GeneralApplicationSettingsData,
  type GeneralSettingsActionState,
} from "../types/general-settings-types";

type GeneralSettingsFormProps = {
  data:
    GeneralApplicationSettingsData;
};

const INITIAL_ACTION_STATE: GeneralSettingsActionState =
  {
    status: "IDLE",

    message: "",

    fieldErrors: {},

    savedActivityLogId:
      null,
  };

function FieldErrors({
  errors,
}: {
  errors:
    string[] | undefined;
}) {
  if (
    !errors ||
    errors.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      {errors.map(
        (error) => (
          <p
            key={error}
            className="text-xs font-semibold text-red-700"
          >
            {error}
          </p>
        ),
      )}
    </div>
  );
}

function SaveSettingsButton() {
  const {
    pending,
  } = useFormStatus();

  return (
    <button
      type="submit"
      className="starland-btn starland-btn-primary"
      disabled={pending}
    >
      <Save
        className="h-4 w-4"
        aria-hidden="true"
      />

      {pending
        ? "Saving Settings..."
        : "Save General Settings"}
    </button>
  );
}

export function GeneralSettingsForm({
  data,
}: GeneralSettingsFormProps) {
  const [
    state,
    formAction,
  ] = useActionState(
    saveGeneralApplicationSettingsAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      {state.status !==
      "IDLE" ? (
        <section
          role={
            state.status ===
            "ERROR"
              ? "alert"
              : "status"
          }
          className={[
            "rounded-2xl border p-4 text-sm font-semibold leading-6",
            state.status ===
            "SUCCESS"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          <p>
            {state.message}
          </p>

          {state.savedActivityLogId !==
          null ? (
            <p className="mt-1 text-xs">
              Settings activity log: #
              {
                state.savedActivityLogId
              }
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <Building2
              className="h-5 w-5 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Application Identity
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Configure the names displayed
                throughout the attendance system.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="applicationName"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Application Name
            </label>

            <input
              id="applicationName"
              name="applicationName"
              type="text"
              className="starland-input mt-2"
              defaultValue={
                data.settings
                  .applicationName
              }
              maxLength={100}
              required
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  .applicationName
              }
            />
          </div>

          <div>
            <label
              htmlFor="schoolShortName"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              School Short Name
            </label>

            <input
              id="schoolShortName"
              name="schoolShortName"
              type="text"
              className="starland-input mt-2"
              defaultValue={
                data.settings
                  .schoolShortName
              }
              maxLength={30}
              required
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  .schoolShortName
              }
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="schoolName"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Complete School Name
            </label>

            <input
              id="schoolName"
              name="schoolName"
              type="text"
              className="starland-input mt-2"
              defaultValue={
                data.settings
                  .schoolName
              }
              maxLength={150}
              required
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  .schoolName
              }
            />
          </div>
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <Globe2
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Regional Configuration
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Control timezone, locale, date,
                and time presentation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="timeZone"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Timezone
            </label>

            <select
              id="timeZone"
              name="timeZone"
              className="starland-input mt-2"
              defaultValue={
                data.settings.timeZone
              }
            >
              {GENERAL_SETTINGS_TIME_ZONES.map(
                (timeZone) => (
                  <option
                    key={timeZone}
                    value={timeZone}
                  >
                    {timeZone}
                  </option>
                ),
              )}
            </select>

            <FieldErrors
              errors={
                state.fieldErrors
                  .timeZone
              }
            />
          </div>

          <div>
            <label
              htmlFor="locale"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Locale
            </label>

            <select
              id="locale"
              name="locale"
              className="starland-input mt-2"
              defaultValue={
                data.settings.locale
              }
            >
              {GENERAL_SETTINGS_LOCALES.map(
                (locale) => (
                  <option
                    key={locale}
                    value={locale}
                  >
                    {locale}
                  </option>
                ),
              )}
            </select>

            <FieldErrors
              errors={
                state.fieldErrors
                  .locale
              }
            />
          </div>

          <div>
            <label
              htmlFor="dateFormat"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Date Format
            </label>

            <select
              id="dateFormat"
              name="dateFormat"
              className="starland-input mt-2"
              defaultValue={
                data.settings
                  .dateFormat
              }
            >
              {GENERAL_SETTINGS_DATE_FORMATS.map(
                (dateFormat) => (
                  <option
                    key={dateFormat}
                    value={dateFormat}
                  >
                    {dateFormat}
                  </option>
                ),
              )}
            </select>

            <FieldErrors
              errors={
                state.fieldErrors
                  .dateFormat
              }
            />
          </div>

          <div>
            <label
              htmlFor="timeFormat"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Time Format
            </label>

            <select
              id="timeFormat"
              name="timeFormat"
              className="starland-input mt-2"
              defaultValue={
                data.settings
                  .timeFormat
              }
            >
              {GENERAL_SETTINGS_TIME_FORMATS.map(
                (timeFormat) => (
                  <option
                    key={timeFormat}
                    value={timeFormat}
                  >
                    {timeFormat ===
                    "12_HOUR"
                      ? "12-hour clock"
                      : "24-hour clock"}
                  </option>
                ),
              )}
            </select>

            <FieldErrors
              errors={
                state.fieldErrors
                  .timeFormat
              }
            />
          </div>
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <Settings2
              className="h-5 w-5 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Default Behavior
              </h2>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                Configure common defaults used by
                calendars, tables, and reports.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="weekStartsOn"
              className="flex items-center gap-2 text-sm font-bold text-[var(--starland-dark-text)]"
            >
              <CalendarDays
                className="h-4 w-4"
                aria-hidden="true"
              />

              Week Starts On
            </label>

            <select
              id="weekStartsOn"
              name="weekStartsOn"
              className="starland-input mt-2"
              defaultValue={
                data.settings
                  .weekStartsOn
              }
            >
              {GENERAL_SETTINGS_WEEK_STARTS.map(
                (weekStart) => (
                  <option
                    key={weekStart}
                    value={weekStart}
                  >
                    {weekStart ===
                    "MONDAY"
                      ? "Monday"
                      : "Sunday"}
                  </option>
                ),
              )}
            </select>

            <FieldErrors
              errors={
                state.fieldErrors
                  .weekStartsOn
              }
            />
          </div>

          <div>
            <label
              htmlFor="defaultPageSize"
              className="flex items-center gap-2 text-sm font-bold text-[var(--starland-dark-text)]"
            >
              <LayoutList
                className="h-4 w-4"
                aria-hidden="true"
              />

              Default Rows per Page
            </label>

            <select
              id="defaultPageSize"
              name="defaultPageSize"
              className="starland-input mt-2"
              defaultValue={String(
                data.settings
                  .defaultPageSize,
              )}
            >
              {GENERAL_SETTINGS_PAGE_SIZES.map(
                (pageSize) => (
                  <option
                    key={pageSize}
                    value={pageSize}
                  >
                    {pageSize} rows
                  </option>
                ),
              )}
            </select>

            <FieldErrors
              errors={
                state.fieldErrors
                  .defaultPageSize
              }
            />
          </div>
        </div>
      </section>

      <section className="starland-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Clock3
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <div>
              <p className="font-extrabold text-[var(--starland-dark-text)]">
                Current Settings Source
              </p>

              <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                {data.source ===
                "ACTIVITY_LOG"
                  ? `Saved configuration from activity log #${data.latestActivityLogId}.`
                  : "Environment values and safe system defaults are currently active."}
              </p>

              {data.updatedAt ? (
                <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                  Last updated:{" "}
                  {data.updatedAt}
                </p>
              ) : null}
            </div>
          </div>

          <SaveSettingsButton />
        </div>
      </section>
    </form>
  );
}