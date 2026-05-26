import type { ReactNode } from "react";
import { requireCanManageSettings } from "@/features/auth/server/permission-guards";

type SettingsLayoutProps = {
  children: ReactNode;
};

export default async function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  await requireCanManageSettings();

  return <>{children}</>;
}