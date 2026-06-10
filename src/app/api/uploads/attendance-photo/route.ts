import {
  randomUUID,
} from "node:crypto";
import {
  mkdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  NextResponse,
} from "next/server";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  getAttendanceEnforcementPolicy,
  getAttendanceSourceDisabledMessage,
  isAttendanceSourceAllowed,
} from "@/features/attendance/policies/server/attendance-policy-enforcement";
import {
  normalizeAttendancePhotoDirectory,
} from "@/features/attendance/policies/server/attendance-evidence-policy";
import type { AttendancePhotoUploadResponse } from "@/features/attendance/types/attendance-upload-types";
import { canUseOdlWebAttendance } from "@/lib/security/roles";

export const runtime =
  "nodejs";

const allowedMimeTypes =
  new Map<
    string,
    string
  >([
    [
      "image/jpeg",
      "jpg",
    ],
    [
      "image/png",
      "png",
    ],
    [
      "image/webp",
      "webp",
    ],
  ]);

function jsonResponse(
  body:
    AttendancePhotoUploadResponse,
  status: number,
) {
  return NextResponse.json(
    body,
    {
      status,
    },
  );
}

function isJpeg(
  buffer: Buffer,
): boolean {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

function isPng(
  buffer: Buffer,
): boolean {
  const signature = [
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
  ];

  return (
    buffer.length >=
      signature.length &&
    signature.every(
      (
        value,
        index,
      ) =>
        buffer[index] ===
        value,
    )
  );
}

function isWebp(
  buffer: Buffer,
): boolean {
  return (
    buffer.length >= 12 &&
    buffer
      .subarray(0, 4)
      .toString("ascii") ===
      "RIFF" &&
    buffer
      .subarray(8, 12)
      .toString("ascii") ===
      "WEBP"
  );
}

function fileSignatureMatches(
  mimeType: string,
  buffer: Buffer,
): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return isJpeg(
        buffer,
      );

    case "image/png":
      return isPng(
        buffer,
      );

    case "image/webp":
      return isWebp(
        buffer,
      );

    default:
      return false;
  }
}

function resolveSafeStoragePath(
  directory: string,
): {
  storageDirectory: string;
  absoluteDirectory: string;
} {
  const storageDirectory =
    normalizeAttendancePhotoDirectory(
      directory,
    );

  const publicRoot =
    path.resolve(
      process.cwd(),
      "public",
    );

  const absoluteDirectory =
    path.resolve(
      publicRoot,
      storageDirectory,
    );

  const relativeToPublic =
    path.relative(
      publicRoot,
      absoluteDirectory,
    );

  if (
    relativeToPublic.startsWith(
      "..",
    ) ||
    path.isAbsolute(
      relativeToPublic,
    )
  ) {
    throw new Error(
      "Attendance photo storage must remain inside the public directory.",
    );
  }

  return {
    storageDirectory,
    absoluteDirectory,
  };
}

export async function POST(
  request: Request,
) {
  const session =
    await getCurrentSession();

  if (!session) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Authentication is required.",
      },
      401,
    );
  }

  if (
    !canUseOdlWebAttendance(
      session.role,
    )
  ) {
    return jsonResponse(
      {
        ok: false,
        message:
          "You do not have permission to upload attendance photos.",
      },
      403,
    );
  }

  let policy:
    Awaited<
      ReturnType<
        typeof getAttendanceEnforcementPolicy
      >
    >;

  try {
    policy =
      await getAttendanceEnforcementPolicy();
  } catch (error) {
    console.error(
      "Unable to resolve Attendance Policies for photo upload:",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "Attendance photo policy could not be loaded.",
      },
      500,
    );
  }

  if (
    !isAttendanceSourceAllowed({
      source: "WEB",
      policy,
    })
  ) {
    return jsonResponse(
      {
        ok: false,

        message:
          getAttendanceSourceDisabledMessage(
            "WEB",
          ),
      },
      403,
    );
  }

  const formData =
    await request
      .formData()
      .catch(
        () => null,
      );

  if (!formData) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Invalid upload request.",
      },
      400,
    );
  }

  const file =
    formData.get(
      "file",
    );

  if (
    !(file instanceof File)
  ) {
    return jsonResponse(
      {
        ok: false,
        message:
          "No image file was uploaded.",
      },
      400,
    );
  }

  if (file.size <= 0) {
    return jsonResponse(
      {
        ok: false,
        message:
          "The uploaded image is empty.",
      },
      400,
    );
  }

  const extension =
    allowedMimeTypes.get(
      file.type,
    );

  if (!extension) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Only JPG, PNG, and WEBP images are allowed.",
      },
      415,
    );
  }

  const maxBytes =
    policy.maxPhotoSizeMb *
    1024 *
    1024;

  if (
    file.size >
    maxBytes
  ) {
    return jsonResponse(
      {
        ok: false,

        message:
          `Image is too large. Maximum size is ${policy.maxPhotoSizeMb} MB.`,
      },
      413,
    );
  }

  const arrayBuffer =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(
      arrayBuffer,
    );

  if (
    !fileSignatureMatches(
      file.type,
      buffer,
    )
  ) {
    return jsonResponse(
      {
        ok: false,

        message:
          "The uploaded file content does not match its declared image type.",
      },
      415,
    );
  }

  let storage:
    ReturnType<
      typeof resolveSafeStoragePath
    >;

  try {
    storage =
      resolveSafeStoragePath(
        policy.photoDirectory,
      );
  } catch (error) {
    console.error(
      "Invalid Attendance Policy photo directory:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        message:
          "The configured attendance photo directory is invalid.",
      },
      500,
    );
  }

  const fileName =
    `${Date.now()}-${randomUUID()}.${extension}`;

  const relativePath =
    `${storage.storageDirectory}/${fileName}`;

  const absolutePath =
    path.join(
      storage.absoluteDirectory,
      fileName,
    );

  try {
    await mkdir(
      storage.absoluteDirectory,
      {
        recursive: true,
      },
    );

    await writeFile(
      absolutePath,
      buffer,
      {
        flag: "wx",
      },
    );
  } catch (error) {
    console.error(
      "Unable to store attendance photo:",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        message:
          "The attendance photo could not be stored.",
      },
      500,
    );
  }

  return jsonResponse(
    {
      ok: true,

      message:
        "Attendance selfie uploaded successfully.",

      path:
        relativePath,
    },
    201,
  );
}