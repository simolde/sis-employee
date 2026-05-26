import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentSession } from "@/features/auth/server/session";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.name,
        role: session.role,
      }}
    >
      {children}
    </AppShell>
  );
}