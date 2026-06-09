import type {
  SettingsOverviewSummary,
  SettingsSection,
} from "../types/settings-types";

export const SETTINGS_SECTIONS = [
  {
    id: "general",

    title:
      "General Application",

    description:
      "Configure the application name, school name, timezone, locale, date display, and default application behavior.",

    icon:
      "AppWindow",

    status:
      "AVAILABLE",

    href:
      "/dashboard/settings/general",

    stepLabel:
      "Available now",

    features: [
      "Application and school names",
      "Timezone and locale",
      "Date and time formatting",
      "Default table behavior",
    ],
  },
  {
    id: "organization",

    title:
      "Organization Structure",

    description:
      "Manage branches, departments, designations, employee types, and other school organizational records.",

    icon:
      "Building2",

    status:
      "NEXT",

    href:
      null,

    stepLabel:
      "Step 151",

    features: [
      "School and branch information",
      "Departments",
      "Designations",
      "Employee types",
    ],
  },
  {
    id: "attendance",

    title:
      "Attendance Policies",

    description:
      "Configure attendance sources, photo and location requirements, grace periods, late rules, and manual-entry policies.",

    icon:
      "CalendarClock",

    status:
      "PLANNED",

    href:
      null,

    stepLabel:
      "Step 152",

    features: [
      "Time-in and time-out rules",
      "Late and grace-period rules",
      "Photo and location requirements",
      "Manual attendance permissions",
    ],
  },
  {
    id: "automation",

    title:
      "Attendance Automation",

    description:
      "Review protected automation endpoints, scheduler configuration, cron readiness, locks, health checks, and diagnostics.",

    icon:
      "Bot",

    status:
      "AVAILABLE",

    href:
      "/dashboard/attendance/automation/configuration",

    stepLabel:
      "Available now",

    features: [
      "Protected API secrets",
      "Scheduler timing",
      "Hostinger cron monitoring",
      "Automation lock configuration",
    ],
  },
  {
    id: "security",

    title:
      "Security and Access",

    description:
      "Configure authentication, sessions, password rules, account lockout, roles, permissions, and settings access.",

    icon:
      "ShieldCheck",

    status:
      "PLANNED",

    href:
      null,

    stepLabel:
      "Step 153",

    features: [
      "Password policy",
      "Login lockout",
      "Session configuration",
      "Roles and permissions",
    ],
  },
  {
    id: "notifications",

    title:
      "Notifications",

    description:
      "Configure system email, attendance alerts, leave notifications, notices, and administrative recipients.",

    icon:
      "BellRing",

    status:
      "PLANNED",

    href:
      null,

    stepLabel:
      "Step 154",

    features: [
      "SMTP configuration",
      "Attendance notifications",
      "Leave notifications",
      "Administrative recipients",
    ],
  },
  {
    id: "storage",

    title:
      "Files and Storage",

    description:
      "Configure employee photos, attendance captures, file-size limits, local storage, and future cloud storage providers.",

    icon:
      "HardDriveUpload",

    status:
      "PLANNED",

    href:
      null,

    stepLabel:
      "Step 155",

    features: [
      "Employee profile photos",
      "Attendance webcam captures",
      "File-size restrictions",
      "Local or cloud storage",
    ],
  },
  {
    id: "integrations",

    title:
      "Integrations",

    description:
      "Manage external services such as Google, email providers, future Redis, object storage, and kiosk synchronization.",

    icon:
      "Cable",

    status:
      "PLANNED",

    href:
      null,

    stepLabel:
      "Step 156",

    features: [
      "Google integrations",
      "Email providers",
      "Optional Redis connection",
      "RFID kiosk synchronization",
    ],
  },
  {
    id: "maintenance",

    title:
      "System Maintenance",

    description:
      "Review environment health, database connectivity, application diagnostics, maintenance operations, and settings audit history.",

    icon:
      "Wrench",

    status:
      "PLANNED",

    href:
      null,

    stepLabel:
      "Step 156",

    features: [
      "Environment diagnostics",
      "Database health",
      "Settings audit history",
      "Maintenance operations",
    ],
  },
] as const satisfies readonly SettingsSection[];

export function getSettingsOverviewSummary(): SettingsOverviewSummary {
  return {
    totalSections:
      SETTINGS_SECTIONS.length,

    availableSections:
      SETTINGS_SECTIONS.filter(
        (section) =>
          section.status ===
          "AVAILABLE",
      ).length,

    nextSections:
      SETTINGS_SECTIONS.filter(
        (section) =>
          section.status ===
          "NEXT",
      ).length,

    plannedSections:
      SETTINGS_SECTIONS.filter(
        (section) =>
          section.status ===
          "PLANNED",
      ).length,
  };
}