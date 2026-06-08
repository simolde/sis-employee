import { getAttendanceAutomationAlertCenterData } from "./attendance-automation-alert-queries";
import {
  ATTENDANCE_AUTOMATION_ALERT_CODES,
  type AttendanceAutomationAlertCodeFilter,
  type AttendanceAutomationAlertFilters,
  type AttendanceAutomationAlertSeverityFilter,
  type AttendanceAutomationFilteredAlertResult,
} from "../types/attendance-automation-alert-filter-types";
import type {
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertItem,
} from "../types/attendance-automation-alert-types";

function singleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function normalizeSeverity(
  value: string,
): AttendanceAutomationAlertSeverityFilter {
  const normalized = value
    .trim()
    .toUpperCase();

  if (
    normalized === "CRITICAL" ||
    normalized === "WARNING" ||
    normalized === "INFO"
  ) {
    return normalized;
  }

  return "";
}

function normalizeCode(
  value: string,
): AttendanceAutomationAlertCodeFilter {
  const normalized = value
    .trim()
    .toUpperCase();

  const matchedCode =
    ATTENDANCE_AUTOMATION_ALERT_CODES.find(
      (code) => code === normalized,
    );

  return matchedCode ?? "";
}

function alertMatchesSearch(
  alert: AttendanceAutomationAlertItem,
  query: string,
): boolean {
  if (!query) {
    return true;
  }

  const searchableText = [
    alert.code,
    alert.severity,
    alert.title,
    alert.message,
    ...alert.details,
    alert.action?.label ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(
    query.toLowerCase(),
  );
}

function getAvailableCodes(
  alerts: AttendanceAutomationAlertItem[],
): AttendanceAutomationAlertCode[] {
  const activeCodes = new Set(
    alerts.map((alert) => alert.code),
  );

  return [
    ...ATTENDANCE_AUTOMATION_ALERT_CODES,
  ].sort((left, right) => {
    const leftActive = activeCodes.has(left);
    const rightActive = activeCodes.has(right);

    if (leftActive !== rightActive) {
      return leftActive ? -1 : 1;
    }

    return left.localeCompare(right);
  });
}

export function parseAttendanceAutomationAlertSearchParams(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
): AttendanceAutomationAlertFilters {
  return {
    q: singleSearchParam(
      searchParams.q,
    ).trim(),

    severity: normalizeSeverity(
      singleSearchParam(
        searchParams.severity,
      ),
    ),

    code: normalizeCode(
      singleSearchParam(
        searchParams.code,
      ),
    ),
  };
}

export async function getFilteredAttendanceAutomationAlerts(
  filters: AttendanceAutomationAlertFilters,
): Promise<AttendanceAutomationFilteredAlertResult> {
  const source =
    await getAttendanceAutomationAlertCenterData();

  const alerts = source.alerts.filter(
    (alert) => {
      if (
        filters.severity &&
        alert.severity !==
          filters.severity
      ) {
        return false;
      }

      if (
        filters.code &&
        alert.code !== filters.code
      ) {
        return false;
      }

      return alertMatchesSearch(
        alert,
        filters.q,
      );
    },
  );

  return {
    source,
    filters,
    alerts,

    availableCodes:
      getAvailableCodes(
        source.alerts,
      ),

    summary: {
      totalMatchingAlerts:
        alerts.length,

      matchingCriticalAlerts:
        alerts.filter(
          (alert) =>
            alert.severity ===
            "CRITICAL",
        ).length,

      matchingWarningAlerts:
        alerts.filter(
          (alert) =>
            alert.severity ===
            "WARNING",
        ).length,

      matchingInformationalAlerts:
        alerts.filter(
          (alert) =>
            alert.severity ===
            "INFO",
        ).length,

      hasActiveFilters: Boolean(
        filters.q ||
          filters.severity ||
          filters.code,
      ),
    },
  };
}