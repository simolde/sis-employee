export type OrganizationInspectableTableName =
  | "departments"
  | "designations"
  | "emp_types";

export type OrganizationTableSchemaInspectionStatus =
  | "READY"
  | "MISSING"
  | "ERROR";

export type OrganizationTableSchemaColumn = {
  name: string;

  ordinalPosition: number;

  dataType: string;
  columnType: string;

  nullable: boolean;

  defaultValue: string | null;

  keyType: string | null;
  extra: string | null;

  maximumLength: number | null;

  comment: string | null;

  autoIncrement: boolean;
  generated: boolean;
};

export type OrganizationTableSchemaIndex = {
  name: string;

  unique: boolean;
  primary: boolean;

  columns: string[];
};

export type OrganizationTableSchemaForeignKey = {
  constraintName: string;

  columnName: string;

  referencedTableName: string;
  referencedColumnName: string;

  updateRule: string | null;
  deleteRule: string | null;
};

export type OrganizationTableSchemaIncomingForeignKey = {
  constraintName: string;

  referencingTableName: string;
  referencingColumnName: string;

  referencedColumnName: string;

  updateRule: string | null;
  deleteRule: string | null;
};

export type OrganizationTableSchemaDetectedFields = {
  idColumn: string | null;

  nameColumn: string | null;
  codeColumn: string | null;

  branchIdColumn: string | null;
  departmentIdColumn: string | null;

  descriptionColumn: string | null;
  statusColumn: string | null;

  createdAtColumn: string | null;
  updatedAtColumn: string | null;
};

export type OrganizationTableSchemaSampleRow =
  Record<
    string,
    string | number | boolean | null
  >;

export type OrganizationTableSchemaInspectionData = {
  status:
    OrganizationTableSchemaInspectionStatus;

  statusLabel: string;
  statusDescription: string;

  generatedAt: string;
  generatedAtIso: string;

  databaseName: string | null;

  tableName:
    OrganizationInspectableTableName;

  entityLabel: string;
  entityPluralLabel: string;

  tableExists: boolean;

  recordCount: number;

  columns:
    OrganizationTableSchemaColumn[];

  indexes:
    OrganizationTableSchemaIndex[];

  foreignKeys:
    OrganizationTableSchemaForeignKey[];

  incomingForeignKeys:
    OrganizationTableSchemaIncomingForeignKey[];

  detectedFields:
    OrganizationTableSchemaDetectedFields;

  requiredInsertColumns: string[];

  sampleColumnNames: string[];

  sampleRows:
    OrganizationTableSchemaSampleRow[];

  crudReadiness: {
    primaryKeyDetected: boolean;
    displayNameDetected: boolean;

    safeForTypedCrud: boolean;

    blockingReasons: string[];
  };

  errorMessage: string | null;
};

export type OrganizationTableSchemaCopyReport = {
  tableName:
    OrganizationInspectableTableName;

  databaseName: string | null;

  recordCount: number;

  detectedFields:
    OrganizationTableSchemaDetectedFields;

  requiredInsertColumns: string[];

  columns:
    OrganizationTableSchemaColumn[];

  indexes:
    OrganizationTableSchemaIndex[];

  foreignKeys:
    OrganizationTableSchemaForeignKey[];

  incomingForeignKeys:
    OrganizationTableSchemaIncomingForeignKey[];

  crudReadiness:
    OrganizationTableSchemaInspectionData["crudReadiness"];
};