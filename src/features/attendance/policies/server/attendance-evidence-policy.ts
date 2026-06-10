const SAFE_DIRECTORY_PATTERN =
  /^[A-Za-z0-9/_-]+$/;

const ALLOWED_PHOTO_EXTENSIONS =
  new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
  ]);

export function normalizeAttendancePhotoDirectory(
  directory: string,
): string {
  const normalized =
    directory
      .trim()
      .replaceAll("\\", "/")
      .replace(/^\/+/u, "")
      .replace(/\/+$/u, "");

  if (
    !normalized ||
    normalized.includes("..") ||
    !SAFE_DIRECTORY_PATTERN.test(
      normalized,
    )
  ) {
    throw new Error(
      "The configured attendance photo directory is invalid.",
    );
  }

  return normalized;
}

export function normalizeOptionalText(
  value:
    | string
    | null
    | undefined,
): string | null {
  const normalized =
    value?.trim() ?? "";

  return normalized.length > 0
    ? normalized
    : null;
}

export function isAttendancePhotoPathAllowed(
  photoPath:
    | string
    | null
    | undefined,
  configuredDirectory: string,
): boolean {
  const normalizedPhotoPath =
    normalizeOptionalText(
      photoPath,
    );

  if (!normalizedPhotoPath) {
    return false;
  }

  if (
    normalizedPhotoPath.startsWith(
      "/",
    ) ||
    normalizedPhotoPath.includes(
      "\\",
    ) ||
    normalizedPhotoPath.includes(
      "..",
    )
  ) {
    return false;
  }

  let normalizedDirectory:
    string;

  try {
    normalizedDirectory =
      normalizeAttendancePhotoDirectory(
        configuredDirectory,
      );
  } catch {
    return false;
  }

  if (
    !normalizedPhotoPath.startsWith(
      `${normalizedDirectory}/`,
    )
  ) {
    return false;
  }

  const extension =
    normalizedPhotoPath
      .split(".")
      .pop()
      ?.toLowerCase();

  return (
    extension !== undefined &&
    ALLOWED_PHOTO_EXTENSIONS.has(
      extension,
    )
  );
}

export function buildAttendanceEvidenceErrorMessage(
  input: {
    requirePhoto: boolean;
    requireLocation: boolean;
  },
): string {
  if (
    input.requirePhoto &&
    input.requireLocation
  ) {
    return "Selfie, GPS coordinates, and full address are required before submitting.";
  }

  if (input.requirePhoto) {
    return "A selfie photo is required before submitting attendance.";
  }

  if (input.requireLocation) {
    return "GPS coordinates and full address are required before submitting attendance.";
  }

  return "Review the attendance information and try again.";
}