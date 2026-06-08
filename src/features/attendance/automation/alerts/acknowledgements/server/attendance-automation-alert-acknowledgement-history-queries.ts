import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_ENTITY_TYPE,
} from "../../types/attendance-automation-alert-acknowledgement-types";
import type {
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertSeverity,
} from "../../types/attendance-automation-alert-types";
import type {
  AttendanceAutomationAcknowledgementHistoryAction,
  AttendanceAutomationAcknowledgementHistoryActionFilter,
  AttendanceAutomationAcknowledgementHistoryData,
  AttendanceAutomationAcknowledgementHistoryFilters,
  AttendanceAutomationAcknowledgementHistoryRecord,
  AttendanceAutomationAcknowledgementHistoryStatus,
  AttendanceAutomationAcknowledgementHistoryStatusFilter,
} from "../types/attendance-automation-alert-acknowledgement-history-types";

const DEFAULT_PAGE_SIZE = 20;
const ALLOWED_PAGE_SIZES = new Set([
  20,
  50,
  100,
]);

const MAXIMUM_SCANNED_RECORDS = 5000;
const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

type AcknowledgementActivityLogRecord = {
  activityLogId: number;
  actorUserId: number | null;
  action: string;
  entityId: string | null;
  newValue: Prisma.JsonValue | null;
  createdAt: Date;
};

function singleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parsePositiveInteger(
  value: string,
  fallback: number,
): number {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
}

function getManilaDateInputValue(
  offsetDays = 0,
): string {
  const targetDate = new Date(
    Date.now() +
      offsetDays * MILLISECONDS_PER_DAY,
  );

  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(targetDate);

  const year =
    parts.find(
      (part) => part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) => part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) => part.type === "day",
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function isValidDateInput(
  value: string,
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const parsed = new Date(
    `${value}T00:00:00+08:00`,
  );

  return !Number.isNaN(
    parsed.getTime(),
  );
}

function normalizeDateRange(input: {
  dateFrom: string;
  dateTo: string;
}): {
  dateFrom: string;
  dateTo: string;
} {
  let dateFrom = isValidDateInput(
    input.dateFrom,
  )
    ? input.dateFrom
    : getManilaDateInputValue(-29);

  let dateTo = isValidDateInput(
    input.dateTo,
  )
    ? input.dateTo
    : getManilaDateInputValue();

  const dateFromValue = new Date(
    `${dateFrom}T00:00:00+08:00`,
  );

  const dateToValue = new Date(
    `${dateTo}T00:00:00+08:00`,
  );

  if (
    dateFromValue.getTime() >
    dateToValue.getTime()
  ) {
    const originalDateFrom = dateFrom;

    dateFrom = dateTo;
    dateTo = originalDateFrom;
  }

  return {
    dateFrom,
    dateTo,
  };
}

function normalizeAction(
  value: string,
): AttendanceAutomationAcknowledgementHistoryActionFilter {
  const normalized =
    value.trim().toUpperCase();

  if (
    normalized === "ACKNOWLEDGED" ||
    normalized === "CLEARED"
  ) {
    return normalized;
  }

  return "";
}

function normalizeStatus(
  value: string,
): AttendanceAutomationAcknowledgementHistoryStatusFilter {
  const normalized =
    value.trim().toUpperCase();

  if (
    normalized === "ACTIVE" ||
    normalized === "EXPIRED" ||
    normalized === "CLEARED" ||
    normalized === "SUPERSEDED"
  ) {
    return normalized;
  }

  return "";
}

function normalizePageSize(
  value: string,
): number {
  const parsed = parsePositiveInteger(
    value,
    DEFAULT_PAGE_SIZE,
  );

  return ALLOWED_PAGE_SIZES.has(parsed)
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

function isJsonObject(
  value: Prisma.JsonValue | null,
): value is Prisma.JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readString(
  object: Prisma.JsonObject,
  key: string,
  fallback = "",
): string {
  const value = object[key];

  return typeof value === "string"
    ? value
    : fallback;
}

function readNumber(
  object: Prisma.JsonObject,
  key: string,
): number | null {
  const value = object[key];

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

function parseDate(
  value: string,
): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed;
}

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

function normalizeSeverity(
  value: string,
): AttendanceAutomationAlertSeverity | "UNKNOWN" {
  const normalized =
    value.trim().toUpperCase();

  if (
    normalized === "CRITICAL" ||
    normalized === "WARNING" ||
    normalized === "INFO"
  ) {
    return normalized;
  }

  return "UNKNOWN";
}

function normalizeHistoryAction(
  action: string,
): AttendanceAutomationAcknowledgementHistoryAction {
  return action ===
    ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION
    ? "CLEARED"
    : "ACKNOWLEDGED";
}

function buildLatestEventMap(
  records: AcknowledgementActivityLogRecord[],
): Map<
  string,
  AcknowledgementActivityLogRecord
> {
  const map =
    new Map<
      string,
      AcknowledgementActivityLogRecord
    >();

  for (const record of records) {
    if (
      !record.entityId ||
      map.has(record.entityId)
    ) {
      continue;
    }

    map.set(
      record.entityId,
      record,
    );
  }

  return map;
}

function getAcknowledgementStatus(input: {
  record: AcknowledgementActivityLogRecord;
  latestEvent:
    | AcknowledgementActivityLogRecord
    | undefined;
  acknowledgedUntil: Date | null;
  now: Date;
}): AttendanceAutomationAcknowledgementHistoryStatus {
  if (
    input.record.action ===
    ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION
  ) {
    return "CLEARED";
  }

  if (
    input.latestEvent &&
    input.latestEvent.activityLogId !==
      input.record.activityLogId
  ) {
    if (
      input.latestEvent.action ===
      ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION
    ) {
      return "CLEARED";
    }

    return "SUPERSEDED";
  }

  if (
    input.acknowledgedUntil &&
    input.acknowledgedUntil.getTime() >
      input.now.getTime()
  ) {
    return "ACTIVE";
  }

  return "EXPIRED";
}

function mapHistoryRecord(input: {
  record: AcknowledgementActivityLogRecord;
  latestEvent:
    | AcknowledgementActivityLogRecord
    | undefined;
  now: Date;
}): AttendanceAutomationAcknowledgementHistoryRecord {
  const object = isJsonObject(
    input.record.newValue,
  )
    ? input.record.newValue
    : {};

  const action =
    normalizeHistoryAction(
      input.record.action,
    );

  const acknowledgedAt =
    action === "ACKNOWLEDGED"
      ? parseDate(
          readString(
            object,
            "acknowledgedAt",
          ),
        ) ?? input.record.createdAt
      : null;

  const acknowledgedUntil =
    action === "ACKNOWLEDGED"
      ? parseDate(
          readString(
            object,
            "acknowledgedUntil",
          ),
        )
      : null;

  const clearedAt =
    action === "CLEARED"
      ? parseDate(
          readString(
            object,
            "clearedAt",
          ),
        ) ?? input.record.createdAt
      : null;

  const note = readString(
    object,
    "note",
  ).trim();

  const alertTitle = readString(
    object,
    "alertTitle",
    action === "CLEARED"
      ? "Automation alert acknowledgement cleared"
      : "Automation alert acknowledged",
  );

  return {
    activityLogId:
      input.record.activityLogId,

    alertCode:
      input.record.entityId ??
      "UNKNOWN_ALERT",

    alertTitle,

    alertSeverity:
      normalizeSeverity(
        readString(
          object,
          "alertSeverity",
        ),
      ),

    action,

    status:
      getAcknowledgementStatus({
        record: input.record,
        latestEvent:
          input.latestEvent,
        acknowledgedUntil,
        now: input.now,
      }),

    actorUserId:
      input.record.actorUserId,

    note: note || null,

    durationHours:
      readNumber(
        object,
        "durationHours",
      ),

    acknowledgedAt:
      acknowledgedAt
        ? formatDateTime(
            acknowledgedAt,
          )
        : null,

    acknowledgedAtIso:
      acknowledgedAt
        ?.toISOString() ?? null,

    acknowledgedUntil:
      acknowledgedUntil
        ? formatDateTime(
            acknowledgedUntil,
          )
        : null,

    acknowledgedUntilIso:
      acknowledgedUntil
        ?.toISOString() ?? null,

    clearedAt:
      clearedAt
        ? formatDateTime(clearedAt)
        : null,

    clearedAtIso:
      clearedAt
        ?.toISOString() ?? null,

    createdAt:
      formatDateTime(
        input.record.createdAt,
      ),

    createdAtIso:
      input.record.createdAt.toISOString(),
  };
}

function recordMatchesSearch(
  record: AttendanceAutomationAcknowledgementHistoryRecord,
  query: string,
): boolean {
  if (!query) {
    return true;
  }

  const searchableText = [
    record.activityLogId,
    record.alertCode,
    record.alertTitle,
    record.alertSeverity,
    record.action,
    record.status,
    record.actorUserId ?? "SYSTEM",
    record.note ?? "",
    record.durationHours ?? "",
    record.acknowledgedAt ?? "",
    record.acknowledgedUntil ?? "",
    record.clearedAt ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(
    query.toLowerCase(),
  );
}

export function parseAttendanceAutomationAcknowledgementHistorySearchParams(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
): AttendanceAutomationAcknowledgementHistoryFilters {
  const normalizedDates =
    normalizeDateRange({
      dateFrom:
        singleSearchParam(
          searchParams.dateFrom,
          getManilaDateInputValue(-29),
        ),

      dateTo:
        singleSearchParam(
          searchParams.dateTo,
          getManilaDateInputValue(),
        ),
    });

  return {
    q: singleSearchParam(
      searchParams.q,
    ).trim(),

    action: normalizeAction(
      singleSearchParam(
        searchParams.action,
      ),
    ),

    status: normalizeStatus(
      singleSearchParam(
        searchParams.status,
      ),
    ),

    dateFrom:
      normalizedDates.dateFrom,

    dateTo:
      normalizedDates.dateTo,

    page: parsePositiveInteger(
      singleSearchParam(
        searchParams.page,
      ),
      1,
    ),

    pageSize: normalizePageSize(
      singleSearchParam(
        searchParams.pageSize,
      ),
    ),
  };
}

export async function getAttendanceAutomationAcknowledgementHistoryData(
  filters: AttendanceAutomationAcknowledgementHistoryFilters,
): Promise<AttendanceAutomationAcknowledgementHistoryData> {
  const dateFrom = new Date(
    `${filters.dateFrom}T00:00:00+08:00`,
  );

  const dateToExclusive = new Date(
    new Date(
      `${filters.dateTo}T00:00:00+08:00`,
    ).getTime() +
      MILLISECONDS_PER_DAY,
  );

  const baseWhere: Prisma.ActivityLogWhereInput =
    {
      entityType:
        ATTENDANCE_AUTOMATION_ALERT_ENTITY_TYPE,

      action: {
        in: [
          ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED_ACTION,
          ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION,
        ],
      },
    };

  const historyWhere: Prisma.ActivityLogWhereInput =
    {
      ...baseWhere,

      createdAt: {
        gte: dateFrom,
        lt: dateToExclusive,
      },
    };

  const [
    totalDatabaseRecords,
    historyRecords,
    latestEventRecords,
  ] = await Promise.all([
    prisma.activityLog.count({
      where: historyWhere,
    }),

    prisma.activityLog.findMany({
      where: historyWhere,

      select: {
        activityLogId: true,
        actorUserId: true,
        action: true,
        entityId: true,
        newValue: true,
        createdAt: true,
      },

      orderBy: [
        {
          createdAt: "desc",
        },
        {
          activityLogId: "desc",
        },
      ],

      take:
        MAXIMUM_SCANNED_RECORDS,
    }),

    prisma.activityLog.findMany({
      where: baseWhere,

      select: {
        activityLogId: true,
        actorUserId: true,
        action: true,
        entityId: true,
        newValue: true,
        createdAt: true,
      },

      orderBy: [
        {
          createdAt: "desc",
        },
        {
          activityLogId: "desc",
        },
      ],

      take:
        MAXIMUM_SCANNED_RECORDS,
    }),
  ]);

  const latestEventMap =
    buildLatestEventMap(
      latestEventRecords,
    );

  const now = new Date();

  const mappedRecords =
    historyRecords.map((record) =>
      mapHistoryRecord({
        record,
        latestEvent:
          record.entityId
            ? latestEventMap.get(
                record.entityId,
              )
            : undefined,
        now,
      }),
    );

  const matchingRecords =
    mappedRecords.filter((record) => {
      if (
        filters.action &&
        record.action !== filters.action
      ) {
        return false;
      }

      if (
        filters.status &&
        record.status !== filters.status
      ) {
        return false;
      }

      return recordMatchesSearch(
        record,
        filters.q,
      );
    });

  const totalRecords =
    matchingRecords.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalRecords /
        filters.pageSize,
    ),
  );

  const page = Math.min(
    filters.page,
    totalPages,
  );

  const startIndex =
    (page - 1) * filters.pageSize;

  const records =
    matchingRecords.slice(
      startIndex,
      startIndex +
        filters.pageSize,
    );

  return {
    filters: {
      ...filters,
      page,
    },

    records,

    summary: {
      totalMatchingRecords:
        matchingRecords.length,

      acknowledgementEvents:
        matchingRecords.filter(
          (record) =>
            record.action ===
            "ACKNOWLEDGED",
        ).length,

      clearingEvents:
        matchingRecords.filter(
          (record) =>
            record.action ===
            "CLEARED",
        ).length,

      activeAcknowledgements:
        matchingRecords.filter(
          (record) =>
            record.status === "ACTIVE",
        ).length,

      expiredAcknowledgements:
        matchingRecords.filter(
          (record) =>
            record.status ===
            "EXPIRED",
        ).length,

      clearedAcknowledgements:
        matchingRecords.filter(
          (record) =>
            record.status ===
            "CLEARED",
        ).length,

      supersededAcknowledgements:
        matchingRecords.filter(
          (record) =>
            record.status ===
            "SUPERSEDED",
        ).length,
    },

    pagination: {
      page,
      pageSize:
        filters.pageSize,
      totalPages,
      totalRecords,

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page < totalPages,
    },

    metadata: {
      scannedRecords:
        historyRecords.length,

      maximumScannedRecords:
        MAXIMUM_SCANNED_RECORDS,

      isPartial:
        totalDatabaseRecords >
        historyRecords.length,
    },
  };
}