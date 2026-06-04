import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  OdlEligibilityCheckItem,
  OdlEligibilityEmployeeProfile,
  OdlEligibilityProfile,
  OdlEligibilityResult,
} from "../types/odl-eligibility-types";

const ODL_PROFILE_KEYWORDS = [
  "ODL",
  "ONLINE",
  "DISTANCE",
  "REMOTE",
  "FLEXIBLE",
];

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function yesNo(value: boolean): string {
  return value ? "YES" : "NO";
}

function includesOdlKeyword(values: Array<string | null | undefined>): boolean {
  const searchableText = values
    .map((value) => value ?? "")
    .join(" ")
    .toUpperCase();

  return ODL_PROFILE_KEYWORDS.some((keyword) =>
    searchableText.includes(keyword),
  );
}

function mapEmployeeProfile(input: {
  empId: number;
  empNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  status: string;
  isFlexible: boolean;
  department: {
    name: string;
  } | null;
  designation: {
    name: string;
  } | null;
  empType: {
    name: string;
  } | null;
  branch: {
    name: string;
  };
  schedule: {
    scheduleCode: string;
    name: string;
  } | null;
}): OdlEligibilityEmployeeProfile {
  return {
    empId: input.empId,
    empNumber: input.empNumber,
    fullName: formatFullName({
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
    }),
    status: input.status,
    departmentName: dash(input.department?.name),
    designationName: dash(input.designation?.name),
    employeeTypeName: dash(input.empType?.name),
    branchName: input.branch.name,
    scheduleName: input.schedule
      ? `${input.schedule.scheduleCode} · ${input.schedule.name}`
      : "—",
    isFlexible: input.isFlexible,
  };
}

function buildChecks(
  profile: OdlEligibilityProfile | null,
): OdlEligibilityCheckItem[] {
  const employee = profile?.employee ?? null;

  const hasOdlProfileMarker = employee
    ? includesOdlKeyword([
        employee.departmentName,
        employee.designationName,
        employee.employeeTypeName,
        employee.scheduleName,
      ])
    : false;

  return [
    {
      label: "User Account",
      ok: Boolean(profile),
      value: profile
        ? `${profile.username} · ${profile.email} · ${profile.userStatus}`
        : "No user profile found",
      helpText: "A valid logged-in user account is required.",
    },
    {
      label: "Linked Employee",
      ok: Boolean(employee),
      value: employee
        ? `${employee.empNumber} · ${employee.fullName}`
        : "No employee profile linked",
      helpText:
        "The user account must be linked to an employee record using empId.",
    },
    {
      label: "Employee Status",
      ok: employee?.status === "ACTIVE",
      value: employee?.status ?? "—",
      helpText: "The linked employee should be ACTIVE.",
    },
    {
      label: "Current Schedule",
      ok: Boolean(employee?.scheduleName && employee.scheduleName !== "—"),
      value: employee?.scheduleName ?? "—",
      helpText:
        "A schedule is needed so the system can decide attendance timing.",
    },
    {
      label: "ODL Profile Marker",
      ok: hasOdlProfileMarker,
      value: hasOdlProfileMarker ? "Found" : "Not found",
      helpText:
        "Check if department, designation, employee type, or schedule contains ODL/Online/Distance/Flexible wording.",
    },
    {
      label: "Flexible Employee Flag",
      ok: Boolean(employee?.isFlexible),
      value: employee ? yesNo(employee.isFlexible) : "—",
      helpText:
        "Some schools mark ODL or flexible employees with the flexible flag.",
    },
  ];
}

export async function getOdlEligibilityProfile(
  userId: number,
): Promise<OdlEligibilityResult> {
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      userId: true,
      username: true,
      email: true,
      status: true,
      employee: {
        select: {
          empId: true,
          empNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          status: true,
          isFlexible: true,
          department: {
            select: {
              name: true,
            },
          },
          designation: {
            select: {
              name: true,
            },
          },
          empType: {
            select: {
              name: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
          schedule: {
            select: {
              scheduleCode: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const profile: OdlEligibilityProfile | null = user
    ? {
        userId: user.userId,
        username: user.username,
        email: user.email,
        userStatus: user.status,
        employee: user.employee ? mapEmployeeProfile(user.employee) : null,
      }
    : null;

  return {
    profile,
    checks: buildChecks(profile),
  };
}