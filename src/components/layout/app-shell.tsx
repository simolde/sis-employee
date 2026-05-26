"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { SystemRole } from "@/lib/security/roles";
import { Footer } from "./footer";
import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
  children: ReactNode;
  user: {
    name: string;
    role: SystemRole;
  };
};

export function AppShell({ children, user }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--starland-light-bg)]">
      <Sidebar role={user.role} />

      <MobileSidebar
        role={user.role}
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <Topbar
          userName={user.name}
          role={user.role}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>

        <Footer />
      </div>
    </div>
  );
}