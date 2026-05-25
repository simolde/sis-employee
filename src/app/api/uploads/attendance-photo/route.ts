import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import type { AttendancePhotoUploadResponse } from "@/features/attendance/types/attendance-upload-types";

export const runtime = "nodejs";

const allowedMimeTypes = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function jsonResponse(body: AttendancePhotoUploadResponse, status: number) {
  return NextResponse.json(body, {
    status,
  });
}

function safeStorageDirectory(directory: string): string {
  return directory
    .replaceAll("\\", "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return jsonResponse(
      {
        ok: false,
        message: "Invalid upload request.",
      },
      400,
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonResponse(
      {
        ok: false,
        message: "No image file was uploaded.",
      },
      400,
    );
  }

  const extension = allowedMimeTypes.get(file.type);

  if (!extension) {
    return jsonResponse(
      {
        ok: false,
        message: "Only JPG, PNG, and WEBP images are allowed.",
      },
      415,
    );
  }

  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;

  if (file.size > maxBytes) {
    return jsonResponse(
      {
        ok: false,
        message: `Image is too large. Maximum size is ${env.MAX_UPLOAD_MB}MB.`,
      },
      413,
    );
  }

  const storageDirectory = safeStorageDirectory(env.ATTENDANCE_PHOTO_DIR);
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;

  const relativePath = `${storageDirectory}/${fileName}`;
  const absoluteDirectory = path.join(process.cwd(), "public", storageDirectory);
  const absolutePath = path.join(absoluteDirectory, fileName);

  await mkdir(absoluteDirectory, {
    recursive: true,
  });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(absolutePath, buffer);

  return jsonResponse(
    {
      ok: true,
      message: "Attendance selfie uploaded successfully.",
      path: relativePath,
    },
    201,
  );
}