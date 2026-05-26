import type { ReactNode } from "react";
import { requireCanManageRfid } from "@/features/auth/server/permission-guards";

type RfidLayoutProps = {
  children: ReactNode;
};

export default async function RfidLayout({ children }: RfidLayoutProps) {
  await requireCanManageRfid();

  return <>{children}</>;
}