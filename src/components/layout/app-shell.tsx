"use client";

import { useState } from "react";
import { Footer } from "./footer";
import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export type AppShellUser = {
  name: string;
  role: string;
};

type AppShellProps = {
  children: React.ReactNode;
  user: AppShellUser;
};

export function AppShell({ children, user }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden lg:pl-72">
      <Sidebar user={user} />

      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        user={user}
      />

      <div className="flex min-h-screen flex-col">
        <Topbar
          user={user}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden">{children}</main>

        <Footer />
      </div>
    </div>
  );
}