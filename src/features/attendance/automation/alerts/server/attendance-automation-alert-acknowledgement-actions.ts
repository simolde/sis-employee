"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { getAttendanceAutomationAlertCenterData } from "@/features/attendance/automation/alerts/server/attendance-automation-alert-queries";
import {
  ATTENDANCE_AUTOMATION_ALERT_CODES,
} from "@/features/attendance/automation/alerts/types/attendance-automation-alert-filter-types";
import {
  ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_ENTITY_TYPE,
} from "@/features/attendance/automation/alerts/types/attendance-automation-alert-acknowledgement-types";
import type { AttendanceAutomationAlertCode } from "@/features/attendance/automation/alerts/types/attendance-automation-alert-types";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";

const ALLOWED_DURATION_HOURS =
  new Set([1, 4, 8, 24, 72]);

const MAXIMUM_NOTE_LENGTH = 300;

function formDataString(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function parseAlertCode(
  value: string,
): AttendanceAutomationAlertCode | null {
  const normalized =
    value.trim().toUpperCase();

  const matched =
    ATTENDANCE_AUTOMATION_ALERT_CODES.find(
      (code) => code === normalized,
    );

  return matched ?? null;
}

function parseDurationHours(
  value: string,
): number | null {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    !ALLOWED_DURATION_HOURS.has(parsed)
  ) {
    return null;
  }

  return parsed;
}

function normalizeNote(
  value: string,
): string | null {
  const normalized = value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAXIMUM_NOTE_LENGTH);

  return normalized || null;
}

function revalidateAutomationAlertPages(): void {
  revalidatePath(
    "/dashboard/attendance/automation",
    "layout",
  );

  revalidatePath(
    "/dashboard/attendance/automation",
  );

  revalidatePath(
    "/dashboard/attendance/automation/alerts",
  );

  revalidatePath(
    "/dashboard/attendance/automation/health",
  );
}

async function requireAutomationAlertManager() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    throw new Error(
      "You do not have permission to manage automation alert acknowledgements.",
    );
  }

  return session;
}

export async function acknowledgeAttendanceAutomationAlertAction(
  formData: FormData,
): Promise<void> {
  const session =
    await requireAutomationAlertManager();

  const alertCode = parseAlertCode(
    formDataString(
      formData,
      "alertCode",
    ),
  );

  const durationHours =
    parseDurationHours(
      formDataString(
        formData,
        "durationHours",
      ),
    );

  const note = normalizeNote(
    formDataString(
      formData,
      "note",
    ),
  );

  if (!alertCode || !durationHours) {
    return;
  }

  const alertCenter =
    await getAttendanceAutomationAlertCenterData();

  const activeAlert =
    alertCenter.alerts.find(
      (alert) =>
        alert.code === alertCode,
    );

  if (!activeAlert) {
    return;
  }

  const acknowledgedAt = new Date();

  const acknowledgedUntil =
    new Date(
      acknowledgedAt.getTime() +
        durationHours *
          60 *
          60 *
          1000,
    );

  await prisma.activityLog.create({
    data: {
      actorUserId:
        session.userId,

      action:
        ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED_ACTION,

      entityType:
        ATTENDANCE_AUTOMATION_ALERT_ENTITY_TYPE,

      entityId:
        alertCode,

      oldValue: {
        acknowledged: false,
      },

      newValue: {
        acknowledged: true,
        alertCode,
        alertSeverity:
          activeAlert.severity,
        alertTitle:
          activeAlert.title,

        acknowledgedAt:
          acknowledgedAt.toISOString(),

        acknowledgedUntil:
          acknowledgedUntil.toISOString(),

        durationHours,
        note,
      },
    },
  });

  revalidateAutomationAlertPages();
}

export async function clearAttendanceAutomationAlertAcknowledgementAction(
  formData: FormData,
): Promise<void> {
  const session =
    await requireAutomationAlertManager();

  const alertCode = parseAlertCode(
    formDataString(
      formData,
      "alertCode",
    ),
  );

  if (!alertCode) {
    return;
  }

  const clearedAt = new Date();

  await prisma.activityLog.create({
    data: {
      actorUserId:
        session.userId,

      action:
        ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION,

      entityType:
        ATTENDANCE_AUTOMATION_ALERT_ENTITY_TYPE,

      entityId:
        alertCode,

      oldValue: {
        acknowledged: true,
      },

      newValue: {
        acknowledged: false,
        alertCode,
        clearedAt:
          clearedAt.toISOString(),
      },
    },
  });

  revalidateAutomationAlertPages();
}