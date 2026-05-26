import type { ReactNode } from "react";
import { requireCanViewAuditLogs } from "@/features/auth/server/permission-guards";

type AuditLogsLayoutProps = {
  children: ReactNode;
};

export default async function AuditLogsLayout({
  children,
}: AuditLogsLayoutProps) {
  await requireCanViewAuditLogs();

  return <>{children}</>;
}