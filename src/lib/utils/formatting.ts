export function formatFullName(input: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}): string {
  const middleInitial = input.middleName
    ? `${input.middleName.trim().charAt(0).toUpperCase()}.`
    : "";

  return [input.firstName, middleInitial, input.lastName]
    .filter(Boolean)
    .join(" ");
}

export function formatEmployeeNumber(empNumber: string): string {
  return empNumber.trim().toUpperCase();
}

export function formatStatusLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatMinutesToHours(totalMinutes: number | null): string {
  if (totalMinutes === null || Number.isNaN(totalMinutes)) {
    return "—";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

export function getInitials(input: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const firstInitial = input.firstName?.trim().charAt(0).toUpperCase() ?? "";
  const lastInitial = input.lastName?.trim().charAt(0).toUpperCase() ?? "";

  return `${firstInitial}${lastInitial}` || "S";
}