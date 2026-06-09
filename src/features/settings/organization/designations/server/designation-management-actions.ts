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
import { getDesignationDependencySummary } from "./designation-management-queries";
import type {
  DesignationFormActionState,
  DesignationFormInput,
} from "../types/designation-management-types";
import {
  designationDeleteSchema,
  designationStatusChangeSchema,
  parseDesignationFormData,
} from "../validators/designation-management-validation";

const DESIGNATION_ACTIVITY_ENTITY_TYPE =
  "designation";

const DESIGNATION_CREATED_ACTION =
  "DESIGNATION_CREATED_V1";

const DESIGNATION_UPDATED_ACTION =
  "DESIGNATION_UPDATED_V1";

const DESIGNATION_STATUS_CHANGED_ACTION =
  "DESIGNATION_STATUS_CHANGED_V1";

const DESIGNATION_DELETED_ACTION =
  "DESIGNATION_DELETED_V1";

type DesignationDatabaseRow = {
  designationId:
    | number
    | bigint
    | string;

  designationCode: string;
  name: string;

  status: string;

  createdAt:
    | Date
    | string;

  updatedAt:
    | Date
    | string;
};

type LastInsertIdRow = {
  designationId:
    | number
    | bigint
    | string;
};

type DuplicateDesignationRow = {
  designationId:
    | number
    | bigint
    | string;

  designationCode: string;
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
      "The database returned an invalid designation identifier.",
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

function toAuditDesignation(
  row:
    DesignationDatabaseRow,
): object {
  return {
    designationId:
      normalizePositiveInteger(
        row.designationId,
      ),

    designationCode:
      row.designationCode,

    name:
      row.name,

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

async function findDesignationRow(
  tx:
    Prisma.TransactionClient,

  designationId: number,
): Promise<DesignationDatabaseRow | null> {
  const rows =
    await tx.$queryRaw<
      DesignationDatabaseRow[]
    >`
      SELECT
        designation_id AS designationId,
        designation_code AS designationCode,
        name,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM designations
      WHERE designation_id = ${designationId}
      LIMIT 1
    `;

  return rows[0] ?? null;
}

async function checkDuplicates(
  tx:
    Prisma.TransactionClient,

  input:
    DesignationFormInput,

  excludedDesignationId:
    number | null,
): Promise<DuplicateCheckResult> {
  const rows =
    excludedDesignationId === null
      ? await tx.$queryRaw<
          DuplicateDesignationRow[]
        >`
          SELECT
            designation_id AS designationId,
            designation_code AS designationCode,
            name
          FROM designations
          WHERE
            LOWER(designation_code) =
              LOWER(${input.designationCode})
            OR LOWER(TRIM(name)) =
              LOWER(TRIM(${input.name}))
          LIMIT 10
        `
      : await tx.$queryRaw<
          DuplicateDesignationRow[]
        >`
          SELECT
            designation_id AS designationId,
            designation_code AS designationCode,
            name
          FROM designations
          WHERE
            designation_id <>
              ${excludedDesignationId}
            AND (
              LOWER(designation_code) =
                LOWER(${input.designationCode})
              OR LOWER(TRIM(name)) =
                LOWER(TRIM(${input.name}))
            )
          LIMIT 10
        `;

  return {
    duplicateCode:
      rows.some(
        (row) =>
          row.designationCode
            .toLowerCase() ===
          input.designationCode
            .toLowerCase(),
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
): DesignationFormActionState {
  return {
    status: "ERROR",

    message:
      "A designation with the same code or name already exists.",

    fieldErrors: {
      ...(duplicates.duplicateCode
        ? {
            designationCode: [
              "Designation code is already in use.",
            ],
          }
        : {}),

      ...(duplicates.duplicateName
        ? {
            name: [
              "Designation name is already in use.",
            ],
          }
        : {}),
    },

    designationId: null,
  };
}

function isDuplicateEntryError(
  error: unknown,
): boolean {
  return (
    error instanceof Error &&
    /duplicate entry/i.test(
      error.message,
    )
  );
}

function revalidateDesignationPaths(): void {
  revalidatePath(
    "/dashboard/settings",
  );

  revalidatePath(
    "/dashboard/settings/organization",
  );

  revalidatePath(
    "/dashboard/settings/organization/designations",
  );
}

export async function createDesignationAction(
  _previousState:
    DesignationFormActionState,

  formData: FormData,
): Promise<DesignationFormActionState> {
  await requireCanManageEmployees();

  const parsed =
    parseDesignationFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted designation fields and try again.",

      fieldErrors:
        parsed.fieldErrors,

      designationId: null,
    };
  }

  let createdDesignationId:
    number;

  try {
    createdDesignationId =
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
            throw new DesignationDuplicateError(
              duplicates,
            );
          }

          await tx.$executeRaw`
            INSERT INTO designations (
              designation_code,
              name,
              status,
              created_at,
              updated_at
            )
            VALUES (
              ${parsed.data.designationCode},
              ${parsed.data.name},
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
                LAST_INSERT_ID() AS designationId
            `;

          const designationId =
            normalizePositiveInteger(
              insertRows[0]
                ?.designationId ?? 0,
            );

          const createdDesignation =
            await findDesignationRow(
              tx,
              designationId,
            );

          if (!createdDesignation) {
            throw new Error(
              "The created designation could not be reloaded.",
            );
          }

          await tx.activityLog.create({
            data: {
              actorUserId: null,

              action:
                DESIGNATION_CREATED_ACTION,

              entityType:
                DESIGNATION_ACTIVITY_ENTITY_TYPE,

              entityId:
                String(
                  designationId,
                ),

              oldValue: {
                existed: false,
              },

              newValue: {
                designation:
                  toAuditDesignation(
                    createdDesignation,
                  ),

                permissionGuard:
                  "requireCanManageEmployees",
              },
            },
          });

          return designationId;
        },
      );
  } catch (error) {
    if (
      error instanceof
      DesignationDuplicateError
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
          "The designation code is already in use.",

        fieldErrors: {
          designationCode: [
            "Designation code must be unique.",
          ],
        },

        designationId: null,
      };
    }

    console.error(
      "Unable to create designation:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The designation could not be created.",

      fieldErrors: {},

      designationId: null,
    };
  }

  revalidateDesignationPaths();

  redirect(
    `/dashboard/settings/organization/designations?notice=created&designationId=${createdDesignationId}`,
  );
}

export async function updateDesignationAction(
  designationId: number,

  _previousState:
    DesignationFormActionState,

  formData: FormData,
): Promise<DesignationFormActionState> {
  await requireCanManageEmployees();

  if (
    !Number.isSafeInteger(
      designationId,
    ) ||
    designationId < 1
  ) {
    return {
      status: "ERROR",

      message:
        "The designation identifier is invalid.",

      fieldErrors: {},

      designationId: null,
    };
  }

  const parsed =
    parseDesignationFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted designation fields and try again.",

      fieldErrors:
        parsed.fieldErrors,

      designationId,
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentDesignation =
          await findDesignationRow(
            tx,
            designationId,
          );

        if (!currentDesignation) {
          throw new DesignationNotFoundError();
        }

        const duplicates =
          await checkDuplicates(
            tx,
            parsed.data,
            designationId,
          );

        if (
          duplicates.duplicateCode ||
          duplicates.duplicateName
        ) {
          throw new DesignationDuplicateError(
            duplicates,
          );
        }

        await tx.$executeRaw`
          UPDATE designations
          SET
            designation_code =
              ${parsed.data.designationCode},
            name =
              ${parsed.data.name},
            status =
              ${parsed.data.status},
            updated_at =
              NOW(3)
          WHERE designation_id =
            ${designationId}
        `;

        const updatedDesignation =
          await findDesignationRow(
            tx,
            designationId,
          );

        if (!updatedDesignation) {
          throw new DesignationNotFoundError();
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              DESIGNATION_UPDATED_ACTION,

            entityType:
              DESIGNATION_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                designationId,
              ),

            oldValue: {
              designation:
                toAuditDesignation(
                  currentDesignation,
                ),
            },

            newValue: {
              designation:
                toAuditDesignation(
                  updatedDesignation,
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
      DesignationDuplicateError
    ) {
      return duplicateState(
        error.duplicates,
      );
    }

    if (
      error instanceof
      DesignationNotFoundError
    ) {
      return {
        status: "ERROR",

        message:
          "The requested designation no longer exists.",

        fieldErrors: {},

        designationId,
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
          "The designation code is already in use.",

        fieldErrors: {
          designationCode: [
            "Designation code must be unique.",
          ],
        },

        designationId,
      };
    }

    console.error(
      "Unable to update designation:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The designation could not be updated.",

      fieldErrors: {},

      designationId,
    };
  }

  revalidateDesignationPaths();

  redirect(
    `/dashboard/settings/organization/designations?notice=updated&designationId=${designationId}`,
  );
}

export async function changeDesignationStatusAction(
  formData: FormData,
): Promise<void> {
  await requireCanManageEmployees();

  const parsed =
    designationStatusChangeSchema.safeParse({
      designationId:
        formData.get(
          "designationId",
        ),

      status:
        formData.get(
          "status",
        ),
    });

  if (!parsed.success) {
    redirect(
      "/dashboard/settings/organization/designations?notice=invalid-request",
    );
  }

  let notice =
    "status-updated";

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentDesignation =
          await findDesignationRow(
            tx,
            parsed.data.designationId,
          );

        if (!currentDesignation) {
          throw new DesignationNotFoundError();
        }

        if (
          currentDesignation.status ===
          parsed.data.status
        ) {
          notice = "no-change";
          return;
        }

        await tx.$executeRaw`
          UPDATE designations
          SET
            status =
              ${parsed.data.status},
            updated_at =
              NOW(3)
          WHERE designation_id =
            ${parsed.data.designationId}
        `;

        const updatedDesignation =
          await findDesignationRow(
            tx,
            parsed.data.designationId,
          );

        if (!updatedDesignation) {
          throw new DesignationNotFoundError();
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              DESIGNATION_STATUS_CHANGED_ACTION,

            entityType:
              DESIGNATION_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                parsed.data.designationId,
              ),

            oldValue: {
              status:
                currentDesignation.status,
            },

            newValue: {
              status:
                updatedDesignation.status,

              permissionGuard:
                "requireCanManageEmployees",
            },
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "Unable to change designation status:",
      error,
    );

    notice = "status-error";
  }

  revalidateDesignationPaths();

  redirect(
    `/dashboard/settings/organization/designations?notice=${notice}&designationId=${parsed.data.designationId}`,
  );
}

export async function deleteDesignationAction(
  formData: FormData,
): Promise<void> {
  await requireCanManageEmployees();

  const parsed =
    designationDeleteSchema.safeParse({
      designationId:
        formData.get(
          "designationId",
        ),
    });

  if (!parsed.success) {
    redirect(
      "/dashboard/settings/organization/designations?notice=invalid-request",
    );
  }

  const dependencySummary =
    await getDesignationDependencySummary(
      parsed.data.designationId,
    );

  if (!dependencySummary.canDelete) {
    redirect(
      `/dashboard/settings/organization/designations/${parsed.data.designationId}/edit?notice=dependency-blocked`,
    );
  }

  let notice =
    "deleted";

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentDesignation =
          await findDesignationRow(
            tx,
            parsed.data.designationId,
          );

        if (!currentDesignation) {
          throw new DesignationNotFoundError();
        }

        await tx.$executeRaw`
          DELETE FROM designations
          WHERE designation_id =
            ${parsed.data.designationId}
        `;

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              DESIGNATION_DELETED_ACTION,

            entityType:
              DESIGNATION_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                parsed.data.designationId,
              ),

            oldValue: {
              designation:
                toAuditDesignation(
                  currentDesignation,
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
      "Unable to delete designation:",
      error,
    );

    notice = "delete-error";
  }

  revalidateDesignationPaths();

  redirect(
    `/dashboard/settings/organization/designations?notice=${notice}`,
  );
}

class DesignationDuplicateError extends Error {
  readonly duplicates:
    DuplicateCheckResult;

  constructor(
    duplicates:
      DuplicateCheckResult,
  ) {
    super(
      "A duplicate designation was detected.",
    );

    this.name =
      "DesignationDuplicateError";

    this.duplicates =
      duplicates;
  }
}

class DesignationNotFoundError extends Error {
  constructor() {
    super(
      "The requested designation was not found.",
    );

    this.name =
      "DesignationNotFoundError";
  }
}