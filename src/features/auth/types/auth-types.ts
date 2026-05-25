import type { SystemRole } from "@/lib/security/roles";

export type AuthSession = {
  userId: number;
  empId: number | null;
  username: string;
  email: string;
  role: SystemRole;
  roleName: string;
  name: string;
  mustChangePassword: boolean;
  issuedAt: number;
  expiresAt: number;
};

export type LoginResponse = {
  ok: boolean;
  message: string;
  redirectTo?: string;
  remainingSeconds?: number;
};