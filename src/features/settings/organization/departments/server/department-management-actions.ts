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
import { getDepartmentDependencySummary } from "./department-management-queries";
import type {
  DepartmentFormActionState,
  DepartmentFormInput,
} from "../types/department-management-types";
import {
  departmentDeleteSchema,
  departmentStatusChangeSchema,
  parseDepartmentFormData,
} from "../validators/department-management-validation";

const DEPARTMENT_ACTIVITY_ENTITY_TYPE =
  "department";

const DEPARTMENT_CREATED_ACTION =
  "DEPARTMENT_CREATED_V1";

const DEPARTMENT_UPDATED_ACTION =
  "DEPARTMENT_UPDATED_V1";

const DEPARTMENT_STATUS_CHANGED_ACTION =
  "DEPARTMENT_STATUS_CHANGED_V1";

const DEPARTMENT_DELETED_ACTION =
  "DEPARTMENT_DELETED_V1";

type DepartmentDatabaseRow = {
  departmentId:
    | number
    | bigint
    | string;

  departmentCode: string;
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
  departmentId:
    | number
    | bigint
    | string;
};

type DuplicateDepartmentRow = {
  departmentId:
    | number
    | bigint
    | string;

  departmentCode: string;
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
    !Number.isSafeInteger(converted) ||
    converted < 1
  ) {
    throw new Error(
      "The database returned an invalid department identifier.",
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

function toAuditDepartment(
  row: DepartmentDatabaseRow,
): object {
  return {
    departmentId:
      normalizePositiveInteger(
        row.departmentId,
      ),

    departmentCode:
      row.departmentCode,

    name:
      row.name,

    status:
      row.status,

    createdAt:
      dateToIso(row.createdAt),

    updatedAt:
      dateToIso(row.updatedAt),
  };
}

async function findDepartmentRow(
  tx: Prisma.TransactionClient,
  departmentId: number,
): Promise<DepartmentDatabaseRow | null> {
  const rows =
    await tx.$queryRaw<
      DepartmentDatabaseRow[]
    >`
      SELECT
        department_id AS departmentId,
        department_code AS departmentCode,
        name,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM departments
      WHERE department_id = ${departmentId}
      LIMIT 1
    `;

  return rows[0] ?? null;
}

async function checkDuplicates(
  tx: Prisma.TransactionClient,

  input: DepartmentFormInput,

  excludedDepartmentId:
    number | null,
): Promise<DuplicateCheckResult> {
  const rows =
    excludedDepartmentId === null
      ? await tx.$queryRaw<
          DuplicateDepartmentRow[]
        >`
          SELECT
            department_id AS departmentId,
            department_code AS departmentCode,
            name
          FROM departments
          WHERE
            LOWER(department_code) =
              LOWER(${input.departmentCode})
            OR LOWER(TRIM(name)) =
              LOWER(TRIM(${input.name}))
          LIMIT 10
        `
      : await tx.$queryRaw<
          DuplicateDepartmentRow[]
        >`
          SELECT
            department_id AS departmentId,
            department_code AS departmentCode,
            name
          FROM departments
          WHERE
            department_id <>
              ${excludedDepartmentId}
            AND (
              LOWER(department_code) =
                LOWER(${input.departmentCode})
              OR LOWER(TRIM(name)) =
                LOWER(TRIM(${input.name}))
            )
          LIMIT 10
        `;

  return {
    duplicateCode:
      rows.some(
        (row) =>
          row.departmentCode.toLowerCase() ===
          input.departmentCode.toLowerCase(),
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
  duplicates: DuplicateCheckResult,
): DepartmentFormActionState {
  return {
    status: "ERROR",

    message:
      "A department with the same code or name already exists.",

    fieldErrors: {
      ...(duplicates.duplicateCode
        ? {
            departmentCode: [
              "Department code is already in use.",
            ],
          }
        : {}),

      ...(duplicates.duplicateName
        ? {
            name: [
              "Department name is already in use.",
            ],
          }
        : {}),
    },

    departmentId: null,
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

function revalidateDepartmentPaths(): void {
  revalidatePath(
    "/dashboard/settings",
  );

  revalidatePath(
    "/dashboard/settings/organization",
  );

  revalidatePath(
    "/dashboard/settings/organization/departments",
  );
}

export async function createDepartmentAction(
  _previousState:
    DepartmentFormActionState,

  formData: FormData,
): Promise<DepartmentFormActionState> {
  await requireCanManageEmployees();

  const parsed =
    parseDepartmentFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted department fields and try again.",

      fieldErrors:
        parsed.fieldErrors,

      departmentId: null,
    };
  }

  let createdDepartmentId:
    number;

  try {
    createdDepartmentId =
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
            throw new DepartmentDuplicateError(
              duplicates,
            );
          }

          await tx.$executeRaw`
            INSERT INTO departments (
              department_code,
              name,
              status,
              created_at,
              updated_at
            )
            VALUES (
              ${parsed.data.departmentCode},
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
                LAST_INSERT_ID() AS departmentId
            `;

          const departmentId =
            normalizePositiveInteger(
              insertRows[0]
                ?.departmentId ?? 0,
            );

          const createdDepartment =
            await findDepartmentRow(
              tx,
              departmentId,
            );

          if (!createdDepartment) {
            throw new Error(
              "The created department could not be reloaded.",
            );
          }

          await tx.activityLog.create({
            data: {
              actorUserId: null,

              action:
                DEPARTMENT_CREATED_ACTION,

              entityType:
                DEPARTMENT_ACTIVITY_ENTITY_TYPE,

              entityId:
                String(departmentId),

              oldValue: {
                existed: false,
              },

              newValue: {
                department:
                  toAuditDepartment(
                    createdDepartment,
                  ),

                permissionGuard:
                  "requireCanManageEmployees",
              },
            },
          });

          return departmentId;
        },
      );
  } catch (error) {
    if (
      error instanceof
      DepartmentDuplicateError
    ) {
      return duplicateState(
        error.duplicates,
      );
    }

    if (
      isDuplicateEntryError(error)
    ) {
      return {
        status: "ERROR",

        message:
          "The department code is already in use.",

        fieldErrors: {
          departmentCode: [
            "Department code must be unique.",
          ],
        },

        departmentId: null,
      };
    }

    console.error(
      "Unable to create department:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The department could not be created.",

      fieldErrors: {},

      departmentId: null,
    };
  }

  revalidateDepartmentPaths();

  redirect(
    `/dashboard/settings/organization/departments?notice=created&departmentId=${createdDepartmentId}`,
  );
}

export async function updateDepartmentAction(
  departmentId: number,

  _previousState:
    DepartmentFormActionState,

  formData: FormData,
): Promise<DepartmentFormActionState> {
  await requireCanManageEmployees();

  if (
    !Number.isSafeInteger(
      departmentId,
    ) ||
    departmentId < 1
  ) {
    return {
      status: "ERROR",

      message:
        "The department identifier is invalid.",

      fieldErrors: {},

      departmentId: null,
    };
  }

  const parsed =
    parseDepartmentFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted department fields and try again.",

      fieldErrors:
        parsed.fieldErrors,

      departmentId,
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentDepartment =
          await findDepartmentRow(
            tx,
            departmentId,
          );

        if (!currentDepartment) {
          throw new DepartmentNotFoundError();
        }

        const duplicates =
          await checkDuplicates(
            tx,
            parsed.data,
            departmentId,
          );

        if (
          duplicates.duplicateCode ||
          duplicates.duplicateName
        ) {
          throw new DepartmentDuplicateError(
            duplicates,
          );
        }

        await tx.$executeRaw`
          UPDATE departments
          SET
            department_code =
              ${parsed.data.departmentCode},
            name =
              ${parsed.data.name},
            status =
              ${parsed.data.status},
            updated_at =
              NOW(3)
          WHERE department_id =
            ${departmentId}
        `;

        const updatedDepartment =
          await findDepartmentRow(
            tx,
            departmentId,
          );

        if (!updatedDepartment) {
          throw new DepartmentNotFoundError();
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              DEPARTMENT_UPDATED_ACTION,

            entityType:
              DEPARTMENT_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(departmentId),

            oldValue: {
              department:
                toAuditDepartment(
                  currentDepartment,
                ),
            },

            newValue: {
              department:
                toAuditDepartment(
                  updatedDepartment,
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
      DepartmentDuplicateError
    ) {
      return duplicateState(
        error.duplicates,
      );
    }

    if (
      error instanceof
      DepartmentNotFoundError
    ) {
      return {
        status: "ERROR",

        message:
          "The requested department no longer exists.",

        fieldErrors: {},

        departmentId,
      };
    }

    if (
      isDuplicateEntryError(error)
    ) {
      return {
        status: "ERROR",

        message:
          "The department code is already in use.",

        fieldErrors: {
          departmentCode: [
            "Department code must be unique.",
          ],
        },

        departmentId,
      };
    }

    console.error(
      "Unable to update department:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The department could not be updated.",

      fieldErrors: {},

      departmentId,
    };
  }

  revalidateDepartmentPaths();

  redirect(
    `/dashboard/settings/organization/departments?notice=updated&departmentId=${departmentId}`,
  );
}

export async function changeDepartmentStatusAction(
  formData: FormData,
): Promise<void> {
  await requireCanManageEmployees();

  const parsed =
    departmentStatusChangeSchema.safeParse({
      departmentId:
        formData.get(
          "departmentId",
        ),

      status:
        formData.get("status"),
    });

  if (!parsed.success) {
    redirect(
      "/dashboard/settings/organization/departments?notice=invalid-request",
    );
  }

  let notice =
    "status-updated";

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentDepartment =
          await findDepartmentRow(
            tx,
            parsed.data.departmentId,
          );

        if (!currentDepartment) {
          throw new DepartmentNotFoundError();
        }

        if (
          currentDepartment.status ===
          parsed.data.status
        ) {
          notice = "no-change";
          return;
        }

        await tx.$executeRaw`
          UPDATE departments
          SET
            status =
              ${parsed.data.status},
            updated_at =
              NOW(3)
          WHERE department_id =
            ${parsed.data.departmentId}
        `;

        const updatedDepartment =
          await findDepartmentRow(
            tx,
            parsed.data.departmentId,
          );

        if (!updatedDepartment) {
          throw new DepartmentNotFoundError();
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              DEPARTMENT_STATUS_CHANGED_ACTION,

            entityType:
              DEPARTMENT_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                parsed.data.departmentId,
              ),

            oldValue: {
              status:
                currentDepartment.status,
            },

            newValue: {
              status:
                updatedDepartment.status,

              permissionGuard:
                "requireCanManageEmployees",
            },
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "Unable to change department status:",
      error,
    );

    notice = "status-error";
  }

  revalidateDepartmentPaths();

  redirect(
    `/dashboard/settings/organization/departments?notice=${notice}&departmentId=${parsed.data.departmentId}`,
  );
}

export async function deleteDepartmentAction(
  formData: FormData,
): Promise<void> {
  await requireCanManageEmployees();

  const parsed =
    departmentDeleteSchema.safeParse({
      departmentId:
        formData.get(
          "departmentId",
        ),
    });

  if (!parsed.success) {
    redirect(
      "/dashboard/settings/organization/departments?notice=invalid-request",
    );
  }

  const dependencySummary =
    await getDepartmentDependencySummary(
      parsed.data.departmentId,
    );

  if (!dependencySummary.canDelete) {
    redirect(
      `/dashboard/settings/organization/departments/${parsed.data.departmentId}/edit?notice=dependency-blocked`,
    );
  }

  let notice = "deleted";

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentDepartment =
          await findDepartmentRow(
            tx,
            parsed.data.departmentId,
          );

        if (!currentDepartment) {
          throw new DepartmentNotFoundError();
        }

        await tx.$executeRaw`
          DELETE FROM departments
          WHERE department_id =
            ${parsed.data.departmentId}
        `;

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              DEPARTMENT_DELETED_ACTION,

            entityType:
              DEPARTMENT_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                parsed.data.departmentId,
              ),

            oldValue: {
              department:
                toAuditDepartment(
                  currentDepartment,
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
      "Unable to delete department:",
      error,
    );

    notice = "delete-error";
  }

  revalidateDepartmentPaths();

  redirect(
    `/dashboard/settings/organization/departments?notice=${notice}`,
  );
}

class DepartmentDuplicateError extends Error {
  readonly duplicates:
    DuplicateCheckResult;

  constructor(
    duplicates: DuplicateCheckResult,
  ) {
    super(
      "A duplicate department was detected.",
    );

    this.name =
      "DepartmentDuplicateError";

    this.duplicates =
      duplicates;
  }
}

class DepartmentNotFoundError extends Error {
  constructor() {
    super(
      "The requested department was not found.",
    );

    this.name =
      "DepartmentNotFoundError";
  }
}