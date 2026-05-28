import "server-only";

import { notFound, redirect } from "next/navigation";
import {
  canManageEmployees,
  canManageLeaves,
  canManageRfid,
  canManageSettings,
  canViewAllAttendance,
  canViewAuditLogs,
} from "@/lib/security/roles";
import { getCurrentSession } from "./session";

export async function requireAuthenticatedUser() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireCanManageEmployees() {
  const session = await requireAuthenticatedUser();

  if (!canManageEmployees(session.role)) {
    notFound();
  }

  return session;
}

export async function requireCanManageRfid() {
  const session = await requireAuthenticatedUser();

  if (!canManageRfid(session.role)) {
    notFound();
  }

  return session;
}

export async function requireCanManageLeaves() {
  const session = await requireAuthenticatedUser();

  if (!canManageLeaves(session.role)) {
    notFound();
  }

  return session;
}

export async function requireCanViewAuditLogs() {
  const session = await requireAuthenticatedUser();

  if (!canViewAuditLogs(session.role)) {
    notFound();
  }

  return session;
}

export async function requireCanManageSettings() {
  const session = await requireAuthenticatedUser();

  if (!canManageSettings(session.role)) {
    notFound();
  }

  return session;
}

export async function requireCanViewAllAttendance() {
  const session = await requireAuthenticatedUser();

  if (!canViewAllAttendance(session.role)) {
    redirect("/dashboard/attendance/odl");
  }

  return session;
}