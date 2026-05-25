export function splitFullName(fullName: string): {
  firstName: string;
  middleName: string | null;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: "Starland",
      middleName: null,
      lastName: "Admin",
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0] ?? "Starland",
      middleName: null,
      lastName: "Admin",
    };
  }

  if (parts.length === 2) {
    return {
      firstName: parts[0] ?? "Starland",
      middleName: null,
      lastName: parts[1] ?? "Admin",
    };
  }

  return {
    firstName: parts[0] ?? "Starland",
    middleName: parts.slice(1, -1).join(" ") || null,
    lastName: parts.at(-1) ?? "Admin",
  };
}

export function requireSeedPassword(password: string): void {
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error("SEED_ADMIN_PASSWORD must contain an uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    throw new Error("SEED_ADMIN_PASSWORD must contain a lowercase letter.");
  }

  if (!/[0-9]/.test(password)) {
    throw new Error("SEED_ADMIN_PASSWORD must contain a number.");
  }
}