import { prisma } from "@/lib/db/prisma";
import type {
  OrganizationSettingsOverviewData,
  OrganizationSettingsReadinessStatus,
  OrganizationSettingsSection,
  OrganizationSettingsTableName,
} from "../types/organization-settings-types";

type InformationSchemaTableRow = {
  tableName: string;
};

type TableCountRow = {
  recordCount:
    | number
    | bigint
    | string;
};

type OrganizationSectionDefinition = Omit<
  OrganizationSettingsSection,
  | "status"
  | "recordCount"
  | "errorMessage"
>;

const ORGANIZATION_SECTION_DEFINITIONS: readonly OrganizationSectionDefinition[] =
  [
    {
      id: "branches",

      title: "Branches",

      description:
        "Manage school branches, branch codes, addresses, operational status, and attendance-location assignments.",

      tableName: "branches",

      icon: "Building2",

      href:
        "/dashboard/settings/organization/branches",

      developmentStep:
        "Available",

      features: [
        "Branch names and codes",
        "Branch addresses and geofences",
        "Dependency-aware deletion",
        "Active, inactive, and archived status",
      ],
    },
    {
      id: "departments",

      title: "Departments",

      description:
        "Manage administrative, academic, maintenance, motorpool, accounting, and other organizational departments.",

      tableName: "departments",

      icon: "Network",

      href:
        "/dashboard/settings/organization/departments",

      developmentStep:
        "Available",

      features: [
        "Department names and codes",
        "Employee and notice relationships",
        "Dependency-aware deletion",
        "Active, inactive, and archived status",
      ],
    },
    {
      id: "designations",

      title: "Designations",

      description:
        "Manage employee job titles, positions, responsibilities, and organizational classifications.",

      tableName: "designations",

      icon: "BadgeCheck",

      href:
        "/dashboard/settings/organization/designations",

      developmentStep:
        "Available",

      features: [
        "Job titles and codes",
        "Employee relationships",
        "Dependency-aware deletion",
        "Active, inactive, and archived status",
      ],
    },
    {
      id: "employee-types",

      title: "Employee Types",

      description:
        "Manage regular, probationary, contractual, part-time, faculty, maintenance, and other employment types.",

      tableName: "emp_types",

      icon: "UsersRound",

      href:
        "/dashboard/settings/organization/employee-types",

      developmentStep:
        "Available",

      features: [
        "Employment classifications",
        "Employee-type names and codes",
        "Employee relationships",
        "Active, inactive, and archived status",
      ],
    },
  ];

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
      timeZone: "Asia/Manila",
    },
  ).format(value);
}

function normalizeCount(
  value:
    | number
    | bigint
    | string
    | undefined,
): number {
  if (value === undefined) {
    return 0;
  }

  const converted =
    Number(value);

  if (
    !Number.isSafeInteger(converted) ||
    converted < 0
  ) {
    return 0;
  }

  return converted;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown database error occurred.";
}

async function countOrganizationTable(
  tableName:
    OrganizationSettingsTableName,
): Promise<number> {
  let rows:
    TableCountRow[];

  switch (tableName) {
    case "branches":
      rows =
        await prisma.$queryRaw<
          TableCountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM branches
        `;
      break;

    case "departments":
      rows =
        await prisma.$queryRaw<
          TableCountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM departments
        `;
      break;

    case "designations":
      rows =
        await prisma.$queryRaw<
          TableCountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM designations
        `;
      break;

    case "emp_types":
      rows =
        await prisma.$queryRaw<
          TableCountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM emp_types
        `;
      break;
  }

  return normalizeCount(
    rows[0]?.recordCount,
  );
}

async function buildReadySection(
  definition:
    OrganizationSectionDefinition,
): Promise<OrganizationSettingsSection> {
  try {
    const recordCount =
      await countOrganizationTable(
        definition.tableName,
      );

    return {
      ...definition,

      status: "READY",

      recordCount,

      errorMessage: null,
    };
  } catch (error) {
    return {
      ...definition,

      status: "ERROR",

      recordCount: null,

      errorMessage:
        getErrorMessage(error),
    };
  }
}

function buildUnavailableSection(
  definition:
    OrganizationSectionDefinition,

  status:
    OrganizationSettingsReadinessStatus,

  message: string,
): OrganizationSettingsSection {
  return {
    ...definition,

    status,

    recordCount: null,

    errorMessage: message,
  };
}

export async function getOrganizationSettingsOverviewData(): Promise<OrganizationSettingsOverviewData> {
  const generatedAt =
    new Date();

  let existingTables:
    Set<string>;

  try {
    const tableRows =
      await prisma.$queryRaw<
        InformationSchemaTableRow[]
      >`
        SELECT
          TABLE_NAME AS tableName
        FROM information_schema.TABLES
        WHERE
          TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME IN (
            'branches',
            'departments',
            'designations',
            'emp_types'
          )
      `;

    existingTables =
      new Set(
        tableRows.map(
          (row) =>
            row.tableName,
        ),
      );
  } catch (error) {
    const message =
      getErrorMessage(error);

    const sections =
      ORGANIZATION_SECTION_DEFINITIONS.map(
        (definition) =>
          buildUnavailableSection(
            definition,
            "ERROR",
            message,
          ),
      );

    return {
      generatedAt:
        formatDateTime(generatedAt),

      generatedAtIso:
        generatedAt.toISOString(),

      databaseReachable: false,

      summary: {
        totalSections:
          sections.length,

        readySections: 0,
        missingSections: 0,

        errorSections:
          sections.length,

        totalRecords: 0,
      },

      sections,
    };
  }

  const sections =
    await Promise.all(
      ORGANIZATION_SECTION_DEFINITIONS.map(
        async (definition) => {
          if (
            !existingTables.has(
              definition.tableName,
            )
          ) {
            return buildUnavailableSection(
              definition,
              "MISSING",
              `Database table "${definition.tableName}" was not found.`,
            );
          }

          return buildReadySection(
            definition,
          );
        },
      ),
    );

  const totalRecords =
    sections.reduce(
      (total, section) =>
        total +
        (section.recordCount ?? 0),
      0,
    );

  return {
    generatedAt:
      formatDateTime(generatedAt),

    generatedAtIso:
      generatedAt.toISOString(),

    databaseReachable: true,

    summary: {
      totalSections:
        sections.length,

      readySections:
        sections.filter(
          (section) =>
            section.status === "READY",
        ).length,

      missingSections:
        sections.filter(
          (section) =>
            section.status === "MISSING",
        ).length,

      errorSections:
        sections.filter(
          (section) =>
            section.status === "ERROR",
        ).length,

      totalRecords,
    },

    sections,
  };
}