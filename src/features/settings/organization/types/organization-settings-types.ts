export type OrganizationSettingsSectionId =
  | "branches"
  | "departments"
  | "designations"
  | "employee-types";

export type OrganizationSettingsTableName =
  | "branches"
  | "departments"
  | "designations"
  | "emp_types";

export type OrganizationSettingsReadinessStatus =
  | "READY"
  | "MISSING"
  | "ERROR";

export type OrganizationSettingsSectionIcon =
  | "Building2"
  | "Network"
  | "BadgeCheck"
  | "UsersRound";

export type OrganizationSettingsSection = {
  id:
    OrganizationSettingsSectionId;

  title: string;
  description: string;

  tableName:
    OrganizationSettingsTableName;

  icon:
    OrganizationSettingsSectionIcon;

  status:
    OrganizationSettingsReadinessStatus;

  recordCount: number | null;

  href: string | null;

  developmentStep: string;

  features: readonly string[];

  errorMessage: string | null;
};

export type OrganizationSettingsOverviewData = {
  generatedAt: string;
  generatedAtIso: string;

  databaseReachable: boolean;

  summary: {
    totalSections: number;

    readySections: number;
    missingSections: number;
    errorSections: number;

    totalRecords: number;
  };

  sections:
    OrganizationSettingsSection[];
};