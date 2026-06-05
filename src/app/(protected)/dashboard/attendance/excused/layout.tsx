import type { ReactNode } from "react";
import { ExcusedSubnav } from "@/features/attendance/excused/components/excused-subnav";

type ExcusedLayoutProps = {
  children: ReactNode;
};

export default function ExcusedLayout({
  children,
}: ExcusedLayoutProps) {
  return (
    <div className="space-y-4">
      <ExcusedSubnav />
      {children}
    </div>
  );
}