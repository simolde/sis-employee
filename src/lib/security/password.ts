import { compare, hash } from "bcryptjs";
import { env } from "@/lib/env";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, env.PASSWORD_HASH_ROUNDS);
}

export async function verifyPassword(input: {
  password: string;
  passwordHash: string;
}): Promise<boolean> {
  return compare(input.password, input.passwordHash);
}

export function validatePasswordStrength(password: string): {
  ok: boolean;
  message: string;
} {
  if (password.length < 8) {
    return {
      ok: false,
      message: "Password must be at least 8 characters.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      ok: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      ok: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      ok: false,
      message: "Password must contain at least one number.",
    };
  }

  return {
    ok: true,
    message: "Password is strong enough.",
  };
}