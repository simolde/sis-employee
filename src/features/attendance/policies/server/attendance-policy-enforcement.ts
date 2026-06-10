import type {
  AttendancePolicyConfig,
  AttendancePolicyResolvedConfig,
} from "@/features/settings/attendance-policies/types/attendance-policy-types";
import { getAttendancePolicyRuntimeConfig } from "@/features/settings/attendance-policies/server/attendance-policy-queries";

export type AttendancePolicySource =
  | "WEB"
  | "MANUAL";

function normalizePositiveInteger(
  value: number | null | undefined,
): number | null {
  if (
    value === null ||
    value === undefined ||
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function normalizeNonNegativeInteger(
  value: number,
): number {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

export async function getAttendanceEnforcementPolicy(): Promise<AttendancePolicyConfig> {
  const resolved =
    await getAttendancePolicyRuntimeConfig();

  return resolved.config;
}

export async function getAttendanceEnforcementPolicyDetails(): Promise<AttendancePolicyResolvedConfig> {
  return getAttendancePolicyRuntimeConfig();
}

export function isAttendanceSourceAllowed(input: {
  source: AttendancePolicySource;
  policy: AttendancePolicyConfig;
}): boolean {
  switch (input.source) {
    case "WEB":
      return input.policy.allowWebTimeIn;

    case "MANUAL":
      return input.policy.allowManualTimeIn;
  }
}

export function getAttendanceSourceDisabledMessage(
  source: AttendancePolicySource,
): string {
  switch (source) {
    case "WEB":
      return "Web attendance is currently disabled by the Attendance Policy settings.";

    case "MANUAL":
      return "Manual attendance creation and correction are currently disabled by the Attendance Policy settings.";
  }
}

export function getEffectiveLateGraceMinutes(input: {
  shiftGraceMinutes: number;
  policyGraceMinutes: number;
}): number {
  const shiftGrace =
    normalizeNonNegativeInteger(
      input.shiftGraceMinutes,
    );

  const policyGrace =
    normalizeNonNegativeInteger(
      input.policyGraceMinutes,
    );

  return Math.max(
    shiftGrace,
    policyGrace,
  );
}

export function resolveAttendanceBranchId(input: {
  explicitBranchId?: number | null;
  employeeBranchId?: number | null;
  defaultBranchId?: number | null;
}): number | null {
  return (
    normalizePositiveInteger(
      input.explicitBranchId,
    ) ??
    normalizePositiveInteger(
      input.employeeBranchId,
    ) ??
    normalizePositiveInteger(
      input.defaultBranchId,
    )
  );
}