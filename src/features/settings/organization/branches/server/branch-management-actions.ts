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
  getBranchDependencySummary,
} from "./branch-management-queries";
import type {
  BranchFormActionState,
  BranchFormInput,
} from "../types/branch-management-types";
import {
  branchDeleteSchema,
  branchStatusChangeSchema,
  parseBranchFormData,
} from "../validators/branch-management-validation";

const BRANCH_ACTIVITY_ENTITY_TYPE =
  "branch";

const BRANCH_CREATED_ACTION =
  "BRANCH_CREATED_V1";

const BRANCH_UPDATED_ACTION =
  "BRANCH_UPDATED_V1";

const BRANCH_STATUS_CHANGED_ACTION =
  "BRANCH_STATUS_CHANGED_V1";

const BRANCH_DELETED_ACTION =
  "BRANCH_DELETED_V1";

type BranchDatabaseRow = {
  branchId:
    | number
    | bigint
    | string;

  branchCode: string;
  name: string;

  address:
    | string
    | null;

  latitude:
    | string
    | number
    | null;

  longitude:
    | string
    | number
    | null;

  radiusM:
    | number
    | bigint
    | string
    | null;

  status: string;

  createdAt:
    | Date
    | string;

  updatedAt:
    | Date
    | string;
};

type LastInsertIdRow = {
  branchId:
    | number
    | bigint
    | string;
};

type DuplicateBranchRow = {
  branchId:
    | number
    | bigint
    | string;

  branchCode: string;
  name: string;
};

type DuplicateCheckResult = {
  duplicateCode: boolean;
  duplicateName: boolean;
};

function normalizePositiveInteger(
  value:
    | number
    | bigint
    | string,
): number {
  const converted =
    Number(value);

  if (
    !Number.isSafeInteger(
      converted,
    ) ||
    converted < 1
  ) {
    throw new Error(
      "The database returned an invalid branch identifier.",
    );
  }

  return converted;
}

function dateToIso(
  value:
    | Date
    | string,
): string {
  const parsed =
    value instanceof Date
      ? value
      : new Date(value);

  return Number.isNaN(
    parsed.getTime(),
  )
    ? new Date(0).toISOString()
    : parsed.toISOString();
}

function toAuditBranch(
  row:
    BranchDatabaseRow,
): object {
  return {
    branchId:
      normalizePositiveInteger(
        row.branchId,
      ),

    branchCode:
      row.branchCode,

    name:
      row.name,

    address:
      row.address,

    latitude:
      row.latitude === null
        ? null
        : String(
            row.latitude,
          ),

    longitude:
      row.longitude === null
        ? null
        : String(
            row.longitude,
          ),

    radiusM:
      row.radiusM === null
        ? null
        : Number(
            row.radiusM,
          ),

    status:
      row.status,

    createdAt:
      dateToIso(
        row.createdAt,
      ),

    updatedAt:
      dateToIso(
        row.updatedAt,
      ),
  };
}

async function findBranchRow(
  tx:
    Prisma.TransactionClient,

  branchId: number,
): Promise<BranchDatabaseRow | null> {
  const rows =
    await tx.$queryRaw<
      BranchDatabaseRow[]
    >`
      SELECT
        branch_id AS branchId,
        branch_code AS branchCode,
        name,
        address,
        CAST(latitude AS CHAR) AS latitude,
        CAST(longitude AS CHAR) AS longitude,
        radius_m AS radiusM,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM branches
      WHERE branch_id = ${branchId}
      LIMIT 1
    `;

  return rows[0] ?? null;
}

async function checkDuplicates(
  tx:
    Prisma.TransactionClient,

  input:
    BranchFormInput,

  excludedBranchId:
    number | null,
): Promise<DuplicateCheckResult> {
  const rows =
    excludedBranchId === null
      ? await tx.$queryRaw<
          DuplicateBranchRow[]
        >`
          SELECT
            branch_id AS branchId,
            branch_code AS branchCode,
            name
          FROM branches
          WHERE
            LOWER(branch_code) =
              LOWER(${input.branchCode})
            OR LOWER(TRIM(name)) =
              LOWER(TRIM(${input.name}))
          LIMIT 10
        `
      : await tx.$queryRaw<
          DuplicateBranchRow[]
        >`
          SELECT
            branch_id AS branchId,
            branch_code AS branchCode,
            name
          FROM branches
          WHERE
            branch_id <> ${excludedBranchId}
            AND (
              LOWER(branch_code) =
                LOWER(${input.branchCode})
              OR LOWER(TRIM(name)) =
                LOWER(TRIM(${input.name}))
            )
          LIMIT 10
        `;

  return {
    duplicateCode:
      rows.some(
        (row) =>
          row.branchCode.toLowerCase() ===
          input.branchCode.toLowerCase(),
      ),

    duplicateName:
      rows.some(
        (row) =>
          row.name
            .trim()
            .toLowerCase() ===
          input.name
            .trim()
            .toLowerCase(),
      ),
  };
}

function duplicateState(
  duplicates:
    DuplicateCheckResult,
): BranchFormActionState {
  return {
    status: "ERROR",

    message:
      "A branch with the same code or name already exists.",

    fieldErrors: {
      ...(duplicates.duplicateCode
        ? {
            branchCode: [
              "Branch code is already in use.",
            ],
          }
        : {}),

      ...(duplicates.duplicateName
        ? {
            name: [
              "Branch name is already in use.",
            ],
          }
        : {}),
    },

    branchId: null,
  };
}

function isDuplicateEntryError(
  error: unknown,
): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /duplicate entry/i.test(
    error.message,
  );
}

function revalidateBranchPaths(): void {
  revalidatePath(
    "/dashboard/settings",
  );

  revalidatePath(
    "/dashboard/settings/organization",
  );

  revalidatePath(
    "/dashboard/settings/organization/branches",
  );
}

export async function createBranchAction(
  _previousState:
    BranchFormActionState,

  formData: FormData,
): Promise<BranchFormActionState> {
  await requireCanManageEmployees();

  const parsed =
    parseBranchFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted branch fields and try again.",

      fieldErrors:
        parsed.fieldErrors,

      branchId: null,
    };
  }

  let createdBranchId:
    number;

  try {
    createdBranchId =
      await prisma.$transaction(
        async (tx) => {
          const duplicates =
            await checkDuplicates(
              tx,
              parsed.data,
              null,
            );

          if (
            duplicates.duplicateCode ||
            duplicates.duplicateName
          ) {
            throw new BranchDuplicateError(
              duplicates,
            );
          }

          await tx.$executeRaw`
            INSERT INTO branches (
              branch_code,
              name,
              address,
              latitude,
              longitude,
              radius_m,
              status,
              created_at,
              updated_at
            )
            VALUES (
              ${parsed.data.branchCode},
              ${parsed.data.name},
              ${parsed.data.address},
              ${parsed.data.latitude},
              ${parsed.data.longitude},
              ${parsed.data.radiusM},
              ${parsed.data.status},
              NOW(3),
              NOW(3)
            )
          `;

          const insertRows =
            await tx.$queryRaw<
              LastInsertIdRow[]
            >`
              SELECT
                LAST_INSERT_ID() AS branchId
            `;

          const branchId =
            normalizePositiveInteger(
              insertRows[0]
                ?.branchId ?? 0,
            );

          const createdBranch =
            await findBranchRow(
              tx,
              branchId,
            );

          if (!createdBranch) {
            throw new Error(
              "The created branch could not be reloaded.",
            );
          }

          await tx.activityLog.create({
            data: {
              actorUserId: null,

              action:
                BRANCH_CREATED_ACTION,

              entityType:
                BRANCH_ACTIVITY_ENTITY_TYPE,

              entityId:
                String(
                  branchId,
                ),

              oldValue: {
                existed: false,
              },

              newValue: {
                branch:
                  toAuditBranch(
                    createdBranch,
                  ),

                permissionGuard:
                  "requireCanManageEmployees",
              },
            },
          });

          return branchId;
        },
      );
  } catch (error) {
    if (
      error instanceof
      BranchDuplicateError
    ) {
      return duplicateState(
        error.duplicates,
      );
    }

    if (
      isDuplicateEntryError(
        error,
      )
    ) {
      return {
        status: "ERROR",

        message:
          "The branch code is already in use.",

        fieldErrors: {
          branchCode: [
            "Branch code must be unique.",
          ],
        },

        branchId: null,
      };
    }

    console.error(
      "Unable to create branch:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The branch could not be created.",

      fieldErrors: {},

      branchId: null,
    };
  }

  revalidateBranchPaths();

  redirect(
    `/dashboard/settings/organization/branches?notice=created&branchId=${createdBranchId}`,
  );
}

export async function updateBranchAction(
  branchId: number,

  _previousState:
    BranchFormActionState,

  formData: FormData,
): Promise<BranchFormActionState> {
  await requireCanManageEmployees();

  if (
    !Number.isSafeInteger(
      branchId,
    ) ||
    branchId < 1
  ) {
    return {
      status: "ERROR",

      message:
        "The branch identifier is invalid.",

      fieldErrors: {},

      branchId: null,
    };
  }

  const parsed =
    parseBranchFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted branch fields and try again.",

      fieldErrors:
        parsed.fieldErrors,

      branchId,
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentBranch =
          await findBranchRow(
            tx,
            branchId,
          );

        if (!currentBranch) {
          throw new BranchNotFoundError();
        }

        const duplicates =
          await checkDuplicates(
            tx,
            parsed.data,
            branchId,
          );

        if (
          duplicates.duplicateCode ||
          duplicates.duplicateName
        ) {
          throw new BranchDuplicateError(
            duplicates,
          );
        }

        await tx.$executeRaw`
          UPDATE branches
          SET
            branch_code =
              ${parsed.data.branchCode},
            name =
              ${parsed.data.name},
            address =
              ${parsed.data.address},
            latitude =
              ${parsed.data.latitude},
            longitude =
              ${parsed.data.longitude},
            radius_m =
              ${parsed.data.radiusM},
            status =
              ${parsed.data.status},
            updated_at =
              NOW(3)
          WHERE branch_id =
            ${branchId}
        `;

        const updatedBranch =
          await findBranchRow(
            tx,
            branchId,
          );

        if (!updatedBranch) {
          throw new BranchNotFoundError();
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              BRANCH_UPDATED_ACTION,

            entityType:
              BRANCH_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                branchId,
              ),

            oldValue: {
              branch:
                toAuditBranch(
                  currentBranch,
                ),
            },

            newValue: {
              branch:
                toAuditBranch(
                  updatedBranch,
                ),

              permissionGuard:
                "requireCanManageEmployees",
            },
          },
        });
      },
    );
  } catch (error) {
    if (
      error instanceof
      BranchDuplicateError
    ) {
      return duplicateState(
        error.duplicates,
      );
    }

    if (
      error instanceof
      BranchNotFoundError
    ) {
      return {
        status: "ERROR",

        message:
          "The requested branch no longer exists.",

        fieldErrors: {},

        branchId,
      };
    }

    if (
      isDuplicateEntryError(
        error,
      )
    ) {
      return {
        status: "ERROR",

        message:
          "The branch code is already in use.",

        fieldErrors: {
          branchCode: [
            "Branch code must be unique.",
          ],
        },

        branchId,
      };
    }

    console.error(
      "Unable to update branch:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The branch could not be updated.",

      fieldErrors: {},

      branchId,
    };
  }

  revalidateBranchPaths();

  redirect(
    `/dashboard/settings/organization/branches?notice=updated&branchId=${branchId}`,
  );
}

export async function changeBranchStatusAction(
  formData: FormData,
): Promise<void> {
  await requireCanManageEmployees();

  const parsed =
    branchStatusChangeSchema.safeParse({
      branchId:
        formData.get(
          "branchId",
        ),

      status:
        formData.get(
          "status",
        ),
    });

  if (!parsed.success) {
    redirect(
      "/dashboard/settings/organization/branches?notice=invalid-request",
    );
  }

  let notice =
    "status-updated";

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentBranch =
          await findBranchRow(
            tx,
            parsed.data.branchId,
          );

        if (!currentBranch) {
          throw new BranchNotFoundError();
        }

        if (
          currentBranch.status ===
          parsed.data.status
        ) {
          notice =
            "no-change";

          return;
        }

        await tx.$executeRaw`
          UPDATE branches
          SET
            status =
              ${parsed.data.status},
            updated_at =
              NOW(3)
          WHERE branch_id =
            ${parsed.data.branchId}
        `;

        const updatedBranch =
          await findBranchRow(
            tx,
            parsed.data.branchId,
          );

        if (!updatedBranch) {
          throw new BranchNotFoundError();
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              BRANCH_STATUS_CHANGED_ACTION,

            entityType:
              BRANCH_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                parsed.data.branchId,
              ),

            oldValue: {
              status:
                currentBranch.status,
            },

            newValue: {
              status:
                updatedBranch.status,

              permissionGuard:
                "requireCanManageEmployees",
            },
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "Unable to change branch status:",
      error,
    );

    notice =
      "status-error";
  }

  revalidateBranchPaths();

  redirect(
    `/dashboard/settings/organization/branches?notice=${notice}&branchId=${parsed.data.branchId}`,
  );
}

export async function deleteBranchAction(
  formData: FormData,
): Promise<void> {
  await requireCanManageEmployees();

  const parsed =
    branchDeleteSchema.safeParse({
      branchId:
        formData.get(
          "branchId",
        ),
    });

  if (!parsed.success) {
    redirect(
      "/dashboard/settings/organization/branches?notice=invalid-request",
    );
  }

  const dependencySummary =
    await getBranchDependencySummary(
      parsed.data.branchId,
    );

  if (
    !dependencySummary.canDelete
  ) {
    redirect(
      `/dashboard/settings/organization/branches/${parsed.data.branchId}/edit?notice=dependency-blocked`,
    );
  }

  let notice =
    "deleted";

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentBranch =
          await findBranchRow(
            tx,
            parsed.data.branchId,
          );

        if (!currentBranch) {
          throw new BranchNotFoundError();
        }

        await tx.$executeRaw`
          DELETE FROM branches
          WHERE branch_id =
            ${parsed.data.branchId}
        `;

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              BRANCH_DELETED_ACTION,

            entityType:
              BRANCH_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                parsed.data.branchId,
              ),

            oldValue: {
              branch:
                toAuditBranch(
                  currentBranch,
                ),
            },

            newValue: {
              deleted: true,

              permissionGuard:
                "requireCanManageEmployees",
            },
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "Unable to delete branch:",
      error,
    );

    notice =
      "delete-error";
  }

  revalidateBranchPaths();

  redirect(
    `/dashboard/settings/organization/branches?notice=${notice}`,
  );
}

class BranchDuplicateError extends Error {
  readonly duplicates:
    DuplicateCheckResult;

  constructor(
    duplicates:
      DuplicateCheckResult,
  ) {
    super(
      "A duplicate branch was detected.",
    );

    this.name =
      "BranchDuplicateError";

    this.duplicates =
      duplicates;
  }
}

class BranchNotFoundError extends Error {
  constructor() {
    super(
      "The requested branch was not found.",
    );

    this.name =
      "BranchNotFoundError";
  }
}