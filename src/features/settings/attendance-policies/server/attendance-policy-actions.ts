"use server";

import {
  Prisma,
} from "@/generated/prisma/client";
import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_POLICY_KEYS,
  type AttendancePolicyActionState,
  type AttendancePolicyFormInput,
  type AttendancePolicyKey,
  type AttendancePolicyValueType,
} from "../types/attendance-policy-types";
import {
  ATTENDANCE_POLICY_DEFINITIONS,
} from "./attendance-policy-definitions";
import {
  getAttendancePolicyRuntimeConfig,
} from "./attendance-policy-queries";
import {
  parseAttendancePolicyFormData,
} from "../validators/attendance-policy-validation";

type ActiveBranchRow = {
  branchId:
    | number
    | bigint
    | string;
};

type PolicyWriteRow = {
  key:
    AttendancePolicyKey;

  value: string;

  valueType:
    AttendancePolicyValueType;

  description: string;
};

function definitionFor(
  key:
    AttendancePolicyKey,
) {
  const definition =
    ATTENDANCE_POLICY_DEFINITIONS.find(
      (candidate) =>
        candidate.key === key,
    );

  if (!definition) {
    throw new Error(
      `Attendance policy definition not found for ${key}.`,
    );
  }

  return definition;
}

function createWriteRow(
  key:
    AttendancePolicyKey,

  value: string,
): PolicyWriteRow {
  const definition =
    definitionFor(key);

  return {
    key,

    value,

    valueType:
      definition.valueType,

    description:
      definition.description,
  };
}

function buildWriteRows(
  input:
    AttendancePolicyFormInput,
): PolicyWriteRow[] {
  return [
    createWriteRow(
      ATTENDANCE_POLICY_KEYS.DEFAULT_BRANCH_ID,
      String(
        input.defaultBranchId,
      ),
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.ALLOW_WEB_TIME_IN,
      String(
        input.allowWebTimeIn,
      ),
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.ALLOW_MANUAL_TIME_IN,
      String(
        input.allowManualTimeIn,
      ),
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.REQUIRE_PHOTO,
      String(
        input.requirePhoto,
      ),
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.REQUIRE_LOCATION,
      String(
        input.requireLocation,
      ),
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.PHOTO_DIRECTORY,
      input.photoDirectory,
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.MAX_PHOTO_SIZE_MB,
      String(
        input.maxPhotoSizeMb,
      ),
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.LATE_GRACE_MINUTES,
      String(
        input.lateGraceMinutes,
      ),
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.AUTO_MARK_MISSING_TIMEOUT,
      String(
        input.autoMarkMissingTimeout,
      ),
    ),

    createWriteRow(
      ATTENDANCE_POLICY_KEYS.MISSING_TIMEOUT_MINUTES,
      String(
        input.missingTimeoutMinutes,
      ),
    ),
  ];
}

async function activeBranchExists(
  branchId: number,
): Promise<boolean> {
  const rows =
    await prisma.$queryRaw<
      ActiveBranchRow[]
    >`
      SELECT
        branch_id AS branchId
      FROM branches
      WHERE
        branch_id = ${branchId}
        AND status = 'ACTIVE'
      LIMIT 1
    `;

  return rows.length > 0;
}

function revalidateAttendancePolicyPaths(): void {
  revalidatePath(
    "/dashboard/settings",
  );

  revalidatePath(
    "/dashboard/settings/attendance-policies",
  );

  revalidatePath(
    "/dashboard/attendance",
  );

  revalidatePath(
    "/dashboard/attendance/manual",
  );

  revalidatePath(
    "/dashboard/attendance/automation",
  );
}

export async function updateAttendancePolicyAction(
  _previousState:
    AttendancePolicyActionState,

  formData: FormData,
): Promise<AttendancePolicyActionState> {
  await requireCanManageEmployees();

  const parsed =
    parseAttendancePolicyFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted Attendance Policy fields and try again.",

      fieldErrors:
        parsed.fieldErrors,
    };
  }

  const branchExists =
    await activeBranchExists(
      parsed.data.defaultBranchId,
    );

  if (!branchExists) {
    return {
      status: "ERROR",

      message:
        "The selected default branch is unavailable.",

      fieldErrors: {
        defaultBranchId: [
          "Select an active branch.",
        ],
      },
    };
  }

  const oldResolved =
    await getAttendancePolicyRuntimeConfig();

  const writeRows =
    buildWriteRows(
      parsed.data,
    );

  try {
    await prisma.$transaction(
      async (
        tx:
          Prisma.TransactionClient,
      ) => {
        for (const row of writeRows) {
          await tx.$executeRaw`
            INSERT INTO attendance_policy_settings (
              setting_key,
              setting_value,
              value_type,
              description,
              created_at,
              updated_at
            )
            VALUES (
              ${row.key},
              ${row.value},
              ${row.valueType},
              ${row.description},
              NOW(3),
              NOW(3)
            )
            ON DUPLICATE KEY UPDATE
              setting_value =
                VALUES(setting_value),
              value_type =
                VALUES(value_type),
              description =
                VALUES(description),
              updated_at =
                NOW(3)
          `;
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              "ATTENDANCE_POLICY_UPDATED_V1",

            entityType:
              "attendance_policy",

            entityId:
              "GLOBAL",

            oldValue: {
              config:
                oldResolved.config,

              sourceMap:
                oldResolved.sourceMap,
            },

            newValue: {
              config:
                parsed.data,

              source:
                "DATABASE",

              changedKeys:
                writeRows.map(
                  (row) =>
                    row.key,
                ),

              permissionGuard:
                "requireCanManageEmployees",
            },
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "Unable to update Attendance Policies:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The Attendance Policies could not be saved.",

      fieldErrors: {},
    };
  }

  revalidateAttendancePolicyPaths();

  redirect(
    "/dashboard/settings/attendance-policies?notice=updated",
  );
}