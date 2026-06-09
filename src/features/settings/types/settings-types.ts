export type SettingsSectionId =
  | "general"
  | "organization"
  | "attendance"
  | "automation"
  | "security"
  | "notifications"
  | "storage"
  | "integrations"
  | "maintenance";

export type SettingsSectionStatus =
  | "AVAILABLE"
  | "NEXT"
  | "PLANNED";

export type SettingsSectionIcon =
  | "AppWindow"
  | "Building2"
  | "CalendarClock"
  | "Bot"
  | "ShieldCheck"
  | "BellRing"
  | "HardDriveUpload"
  | "Cable"
  | "Wrench";

export type SettingsSection = {
  id: SettingsSectionId;

  title: string;
  description: string;

  icon: SettingsSectionIcon;

  status: SettingsSectionStatus;

  href: string | null;

  stepLabel: string;

  features: readonly string[];
};

export type SettingsOverviewSummary = {
  totalSections: number;

  availableSections: number;
  nextSections: number;
  plannedSections: number;
};