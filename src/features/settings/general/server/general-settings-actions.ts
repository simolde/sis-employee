"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { prisma } from "@/lib/db/prisma";
import type {
  GeneralApplicationSettings,
  GeneralSettingsActionState,
} from "../types/general-settings-types";
import { parseGeneralApplicationSettingsFormData } from "../validators/general-settings-validation";
import {
  GENERAL_SETTINGS_ACTIVITY_ACTION,
  GENERAL_SETTINGS_ACTIVITY_ENTITY_ID,
  GENERAL_SETTINGS_ACTIVITY_ENTITY_TYPE,
  getGeneralApplicationSettingsData,
} from "./general-settings-queries";

function settingsFingerprint(
  settings:
    GeneralApplicationSettings,
): string {
  return createHash(
    "sha256",
  )
    .update(
      JSON.stringify(
        settings,
      ),
    )
    .digest("hex");
}

function settingsAreEqual(
  left:
    GeneralApplicationSettings,

  right:
    GeneralApplicationSettings,
): boolean {
  return (
    settingsFingerprint(left) ===
    settingsFingerprint(right)
  );
}

export async function saveGeneralApplicationSettingsAction(
  _previousState:
    GeneralSettingsActionState,

  formData: FormData,
): Promise<GeneralSettingsActionState> {
  await requireCanManageEmployees();

  const parsed =
    parseGeneralApplicationSettingsFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted settings and try again.",

      fieldErrors:
        parsed.fieldErrors,

      savedActivityLogId:
        null,
    };
  }

  try {
    const current =
      await getGeneralApplicationSettingsData();

    if (
      settingsAreEqual(
        current.settings,
        parsed.data,
      )
    ) {
      return {
        status: "SUCCESS",

        message:
          "No settings were changed.",

        fieldErrors: {},

        savedActivityLogId:
          current.latestActivityLogId,
      };
    }

    const updatedAt =
      new Date();

    const fingerprint =
      settingsFingerprint(
        parsed.data,
      );

    const activityLog =
      await prisma.activityLog.create(
        {
          data: {
            actorUserId:
              null,

            action:
              GENERAL_SETTINGS_ACTIVITY_ACTION,

            entityType:
              GENERAL_SETTINGS_ACTIVITY_ENTITY_TYPE,

            entityId:
              GENERAL_SETTINGS_ACTIVITY_ENTITY_ID,

            oldValue: {
              source:
                current.source,

              previousActivityLogId:
                current.latestActivityLogId,

              settings:
                current.settings,
            },

            newValue: {
              version: 1,

              settings:
                parsed.data,

              updatedAt:
                updatedAt.toISOString(),

              fingerprint,
            },
          },

          select: {
            activityLogId:
              true,
          },
        },
      );

    revalidatePath(
      "/dashboard/settings",
    );

    revalidatePath(
      "/dashboard/settings/general",
    );

    return {
      status: "SUCCESS",

      message:
        "General application settings were saved successfully.",

      fieldErrors: {},

      savedActivityLogId:
        activityLog.activityLogId,
    };
  } catch (error) {
    console.error(
      "Unable to save general application settings:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The general application settings could not be saved.",

      fieldErrors: {},

      savedActivityLogId:
        null,
    };
  }
}