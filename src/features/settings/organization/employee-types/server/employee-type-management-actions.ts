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
import { getEmployeeTypeDependencySummary } from "./employee-type-management-queries";
import type {
  EmployeeTypeFormActionState,
  EmployeeTypeFormInput,
} from "../types/employee-type-management-types";
import {
  employeeTypeDeleteSchema,
  employeeTypeStatusChangeSchema,
  parseEmployeeTypeFormData,
} from "../validators/employee-type-management-validation";

const EMPLOYEE_TYPE_ACTIVITY_ENTITY_TYPE =
  "employee_type";

const EMPLOYEE_TYPE_CREATED_ACTION =
  "EMPLOYEE_TYPE_CREATED_V1";

const EMPLOYEE_TYPE_UPDATED_ACTION =
  "EMPLOYEE_TYPE_UPDATED_V1";

const EMPLOYEE_TYPE_STATUS_CHANGED_ACTION =
  "EMPLOYEE_TYPE_STATUS_CHANGED_V1";

const EMPLOYEE_TYPE_DELETED_ACTION =
  "EMPLOYEE_TYPE_DELETED_V1";

type EmployeeTypeDatabaseRow = {
  empTypeId:
    | number
    | bigint
    | string;

  empTypeCode: string;
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
  empTypeId:
    | number
    | bigint
    | string;
};

type DuplicateEmployeeTypeRow = {
  empTypeId:
    | number
    | bigint
    | string;

  empTypeCode: string;
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
      "The database returned an invalid employee type identifier.",
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

function toAuditEmployeeType(
  row: EmployeeTypeDatabaseRow,
): object {
  return {
    empTypeId:
      normalizePositiveInteger(
        row.empTypeId,
      ),

    empTypeCode:
      row.empTypeCode,

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

async function findEmployeeTypeRow(
  tx: Prisma.TransactionClient,
  empTypeId: number,
): Promise<EmployeeTypeDatabaseRow | null> {
  const rows =
    await tx.$queryRaw<
      EmployeeTypeDatabaseRow[]
    >`
      SELECT
        emp_type_id AS empTypeId,
        emp_type_code AS empTypeCode,
        name,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM emp_types
      WHERE emp_type_id = ${empTypeId}
      LIMIT 1
    `;

  return rows[0] ?? null;
}

async function checkDuplicates(
  tx: Prisma.TransactionClient,

  input: EmployeeTypeFormInput,

  excludedEmpTypeId:
    number | null,
): Promise<DuplicateCheckResult> {
  const rows =
    excludedEmpTypeId === null
      ? await tx.$queryRaw<
          DuplicateEmployeeTypeRow[]
        >`
          SELECT
            emp_type_id AS empTypeId,
            emp_type_code AS empTypeCode,
            name
          FROM emp_types
          WHERE
            LOWER(emp_type_code) =
              LOWER(${input.empTypeCode})
            OR LOWER(TRIM(name)) =
              LOWER(TRIM(${input.name}))
          LIMIT 10
        `
      : await tx.$queryRaw<
          DuplicateEmployeeTypeRow[]
        >`
          SELECT
            emp_type_id AS empTypeId,
            emp_type_code AS empTypeCode,
            name
          FROM emp_types
          WHERE
            emp_type_id <> ${excludedEmpTypeId}
            AND (
              LOWER(emp_type_code) =
                LOWER(${input.empTypeCode})
              OR LOWER(TRIM(name)) =
                LOWER(TRIM(${input.name}))
            )
          LIMIT 10
        `;

  return {
    duplicateCode:
      rows.some(
        (row) =>
          row.empTypeCode.toLowerCase() ===
          input.empTypeCode.toLowerCase(),
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
): EmployeeTypeFormActionState {
  return {
    status: "ERROR",

    message:
      "An employee type with the same code or name already exists.",

    fieldErrors: {
      ...(duplicates.duplicateCode
        ? {
            empTypeCode: [
              "Employee type code is already in use.",
            ],
          }
        : {}),

      ...(duplicates.duplicateName
        ? {
            name: [
              "Employee type name is already in use.",
            ],
          }
        : {}),
    },

    empTypeId: null,
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

function revalidateEmployeeTypePaths(): void {
  revalidatePath(
    "/dashboard/settings",
  );

  revalidatePath(
    "/dashboard/settings/organization",
  );

  revalidatePath(
    "/dashboard/settings/organization/employee-types",
  );

  revalidatePath(
    "/dashboard/employees",
  );

  revalidatePath(
    "/dashboard/employees/new",
  );
}

export async function createEmployeeTypeAction(
  _previousState:
    EmployeeTypeFormActionState,

  formData: FormData,
): Promise<EmployeeTypeFormActionState> {
  await requireCanManageEmployees();

  const parsed =
    parseEmployeeTypeFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted employee type fields and try again.",

      fieldErrors:
        parsed.fieldErrors,

      empTypeId: null,
    };
  }

  let createdEmpTypeId:
    number | null = null;

  try {
    createdEmpTypeId =
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
            throw new EmployeeTypeDuplicateError(
              duplicates,
            );
          }

          await tx.$executeRaw`
            INSERT INTO emp_types (
              emp_type_code,
              name,
              status,
              created_at,
              updated_at
            )
            VALUES (
              ${parsed.data.empTypeCode},
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
                LAST_INSERT_ID() AS empTypeId
            `;

          const empTypeId =
            normalizePositiveInteger(
              insertRows[0]
                ?.empTypeId ?? 0,
            );

          const createdEmployeeType =
            await findEmployeeTypeRow(
              tx,
              empTypeId,
            );

          if (!createdEmployeeType) {
            throw new Error(
              "The created employee type could not be reloaded.",
            );
          }

          await tx.activityLog.create({
            data: {
              actorUserId: null,

              action:
                EMPLOYEE_TYPE_CREATED_ACTION,

              entityType:
                EMPLOYEE_TYPE_ACTIVITY_ENTITY_TYPE,

              entityId:
                String(empTypeId),

              oldValue: {
                existed: false,
              },

              newValue: {
                employeeType:
                  toAuditEmployeeType(
                    createdEmployeeType,
                  ),

                permissionGuard:
                  "requireCanManageEmployees",
              },
            },
          });

          return empTypeId;
        },
      );
  } catch (error) {
    if (
      error instanceof
      EmployeeTypeDuplicateError
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
          "The employee type code is already in use.",

        fieldErrors: {
          empTypeCode: [
            "Employee type code must be unique.",
          ],
        },

        empTypeId: null,
      };
    }

    console.error(
      "Unable to create employee type:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The employee type could not be created.",

      fieldErrors: {},

      empTypeId: null,
    };
  }

  if (createdEmpTypeId === null) {
    return {
      status: "ERROR",

      message:
        "The employee type could not be created.",

      fieldErrors: {},

      empTypeId: null,
    };
  }

  revalidateEmployeeTypePaths();

  redirect(
    `/dashboard/settings/organization/employee-types?notice=created&empTypeId=${createdEmpTypeId}`,
  );
}

export async function updateEmployeeTypeAction(
  empTypeId: number,

  _previousState:
    EmployeeTypeFormActionState,

  formData: FormData,
): Promise<EmployeeTypeFormActionState> {
  await requireCanManageEmployees();

  if (
    !Number.isSafeInteger(empTypeId) ||
    empTypeId < 1
  ) {
    return {
      status: "ERROR",

      message:
        "The employee type identifier is invalid.",

      fieldErrors: {},

      empTypeId: null,
    };
  }

  const parsed =
    parseEmployeeTypeFormData(
      formData,
    );

  if (!parsed.ok) {
    return {
      status: "ERROR",

      message:
        "Review the highlighted employee type fields and try again.",

      fieldErrors:
        parsed.fieldErrors,

      empTypeId,
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentEmployeeType =
          await findEmployeeTypeRow(
            tx,
            empTypeId,
          );

        if (!currentEmployeeType) {
          throw new EmployeeTypeNotFoundError();
        }

        const duplicates =
          await checkDuplicates(
            tx,
            parsed.data,
            empTypeId,
          );

        if (
          duplicates.duplicateCode ||
          duplicates.duplicateName
        ) {
          throw new EmployeeTypeDuplicateError(
            duplicates,
          );
        }

        await tx.$executeRaw`
          UPDATE emp_types
          SET
            emp_type_code =
              ${parsed.data.empTypeCode},
            name =
              ${parsed.data.name},
            status =
              ${parsed.data.status},
            updated_at =
              NOW(3)
          WHERE emp_type_id =
            ${empTypeId}
        `;

        const updatedEmployeeType =
          await findEmployeeTypeRow(
            tx,
            empTypeId,
          );

        if (!updatedEmployeeType) {
          throw new EmployeeTypeNotFoundError();
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              EMPLOYEE_TYPE_UPDATED_ACTION,

            entityType:
              EMPLOYEE_TYPE_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(empTypeId),

            oldValue: {
              employeeType:
                toAuditEmployeeType(
                  currentEmployeeType,
                ),
            },

            newValue: {
              employeeType:
                toAuditEmployeeType(
                  updatedEmployeeType,
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
      EmployeeTypeDuplicateError
    ) {
      return duplicateState(
        error.duplicates,
      );
    }

    if (
      error instanceof
      EmployeeTypeNotFoundError
    ) {
      return {
        status: "ERROR",

        message:
          "The requested employee type no longer exists.",

        fieldErrors: {},

        empTypeId,
      };
    }

    if (
      isDuplicateEntryError(error)
    ) {
      return {
        status: "ERROR",

        message:
          "The employee type code is already in use.",

        fieldErrors: {
          empTypeCode: [
            "Employee type code must be unique.",
          ],
        },

        empTypeId,
      };
    }

    console.error(
      "Unable to update employee type:",
      error,
    );

    return {
      status: "ERROR",

      message:
        "The employee type could not be updated.",

      fieldErrors: {},

      empTypeId,
    };
  }

  revalidateEmployeeTypePaths();

  redirect(
    `/dashboard/settings/organization/employee-types?notice=updated&empTypeId=${empTypeId}`,
  );
}

export async function changeEmployeeTypeStatusAction(
  formData: FormData,
): Promise<void> {
  await requireCanManageEmployees();

  const parsed =
    employeeTypeStatusChangeSchema.safeParse({
      empTypeId:
        formData.get("empTypeId"),

      status:
        formData.get("status"),
    });

  if (!parsed.success) {
    redirect(
      "/dashboard/settings/organization/employee-types?notice=invalid-request",
    );
  }

  let notice =
    "status-updated";

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentEmployeeType =
          await findEmployeeTypeRow(
            tx,
            parsed.data.empTypeId,
          );

        if (!currentEmployeeType) {
          throw new EmployeeTypeNotFoundError();
        }

        if (
          currentEmployeeType.status ===
          parsed.data.status
        ) {
          notice = "no-change";
          return;
        }

        await tx.$executeRaw`
          UPDATE emp_types
          SET
            status =
              ${parsed.data.status},
            updated_at =
              NOW(3)
          WHERE emp_type_id =
            ${parsed.data.empTypeId}
        `;

        const updatedEmployeeType =
          await findEmployeeTypeRow(
            tx,
            parsed.data.empTypeId,
          );

        if (!updatedEmployeeType) {
          throw new EmployeeTypeNotFoundError();
        }

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              EMPLOYEE_TYPE_STATUS_CHANGED_ACTION,

            entityType:
              EMPLOYEE_TYPE_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                parsed.data.empTypeId,
              ),

            oldValue: {
              status:
                currentEmployeeType.status,
            },

            newValue: {
              status:
                updatedEmployeeType.status,

              permissionGuard:
                "requireCanManageEmployees",
            },
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "Unable to change employee type status:",
      error,
    );

    notice = "status-error";
  }

  revalidateEmployeeTypePaths();

  redirect(
    `/dashboard/settings/organization/employee-types?notice=${notice}&empTypeId=${parsed.data.empTypeId}`,
  );
}

export async function deleteEmployeeTypeAction(
  formData: FormData,
): Promise<void> {
  await requireCanManageEmployees();

  const parsed =
    employeeTypeDeleteSchema.safeParse({
      empTypeId:
        formData.get("empTypeId"),
    });

  if (!parsed.success) {
    redirect(
      "/dashboard/settings/organization/employee-types?notice=invalid-request",
    );
  }

  const dependencySummary =
    await getEmployeeTypeDependencySummary(
      parsed.data.empTypeId,
    );

  if (!dependencySummary.canDelete) {
    redirect(
      `/dashboard/settings/organization/employee-types/${parsed.data.empTypeId}/edit?notice=dependency-blocked`,
    );
  }

  let notice =
    "deleted";

  try {
    await prisma.$transaction(
      async (tx) => {
        const currentEmployeeType =
          await findEmployeeTypeRow(
            tx,
            parsed.data.empTypeId,
          );

        if (!currentEmployeeType) {
          throw new EmployeeTypeNotFoundError();
        }

        await tx.$executeRaw`
          DELETE FROM emp_types
          WHERE emp_type_id =
            ${parsed.data.empTypeId}
        `;

        await tx.activityLog.create({
          data: {
            actorUserId: null,

            action:
              EMPLOYEE_TYPE_DELETED_ACTION,

            entityType:
              EMPLOYEE_TYPE_ACTIVITY_ENTITY_TYPE,

            entityId:
              String(
                parsed.data.empTypeId,
              ),

            oldValue: {
              employeeType:
                toAuditEmployeeType(
                  currentEmployeeType,
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
      "Unable to delete employee type:",
      error,
    );

    notice = "delete-error";
  }

  revalidateEmployeeTypePaths();

  redirect(
    `/dashboard/settings/organization/employee-types?notice=${notice}`,
  );
}

class EmployeeTypeDuplicateError extends Error {
  readonly duplicates:
    DuplicateCheckResult;

  constructor(
    duplicates: DuplicateCheckResult,
  ) {
    super(
      "A duplicate employee type was detected.",
    );

    this.name =
      "EmployeeTypeDuplicateError";

    this.duplicates =
      duplicates;
  }
}

class EmployeeTypeNotFoundError extends Error {
  constructor() {
    super(
      "The requested employee type was not found.",
    );

    this.name =
      "EmployeeTypeNotFoundError";
  }
}