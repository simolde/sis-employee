export type BranchSchemaInspectionStatus =
  | "READY"
  | "MISSING"
  | "ERROR";

export type BranchSchemaColumn = {
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

export type BranchSchemaIndex = {
  name: string;

  unique: boolean;
  primary: boolean;

  columns: string[];
};

export type BranchSchemaForeignKey = {
  constraintName: string;

  columnName: string;

  referencedTableName: string;
  referencedColumnName: string;

  updateRule: string | null;
  deleteRule: string | null;
};

export type BranchSchemaDetectedFields = {
  idColumn: string | null;

  nameColumn: string | null;
  codeColumn: string | null;

  addressColumn: string | null;

  statusColumn: string | null;

  createdAtColumn: string | null;
  updatedAtColumn: string | null;
};

export type BranchSchemaSampleRow = Record<
  string,
  string | number | boolean | null
>;

export type BranchSchemaInspectionData = {
  status:
    BranchSchemaInspectionStatus;

  statusLabel: string;
  statusDescription: string;

  generatedAt: string;
  generatedAtIso: string;

  databaseName: string | null;

  tableName: "branches";
  tableExists: boolean;

  recordCount: number;

  columns:
    BranchSchemaColumn[];

  indexes:
    BranchSchemaIndex[];

  foreignKeys:
    BranchSchemaForeignKey[];

  detectedFields:
    BranchSchemaDetectedFields;

  requiredInsertColumns: string[];

  sampleColumnNames: string[];

  sampleRows:
    BranchSchemaSampleRow[];

  crudReadiness: {
    primaryKeyDetected: boolean;
    displayNameDetected: boolean;

    safeForTypedCrud: boolean;

    blockingReasons: string[];
  };

  errorMessage: string | null;
};

export type BranchSchemaCopyReport = {
  tableName: "branches";

  databaseName: string | null;

  recordCount: number;

  detectedFields:
    BranchSchemaDetectedFields;

  requiredInsertColumns: string[];

  columns:
    BranchSchemaColumn[];

  indexes:
    BranchSchemaIndex[];

  foreignKeys:
    BranchSchemaForeignKey[];

  crudReadiness:
    BranchSchemaInspectionData["crudReadiness"];
};