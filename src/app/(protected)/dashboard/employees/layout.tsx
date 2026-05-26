import type { ReactNode } from "react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";

type EmployeesLayoutProps = {
  children: ReactNode;
};

export default async function EmployeesLayout({
  children,
}: EmployeesLayoutProps) {
  await requireCanManageEmployees();

  return <>{children}</>;
}