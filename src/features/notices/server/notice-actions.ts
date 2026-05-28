"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageNotices } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import { createNoticeValidationSchema } from "../validators/notice-validation";
import type { NoticeActionState } from "../types/notice-types";

type NoticeAuditValueInput = {
  noticeId: number;
  title: string;
  body: string;
  branchId: number | null;
  departmentId: number | null;
  status: string;
  publishedAt: Date | null;
  expiresAt: Date | null;
  createdById: number | null;
};

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function buildNoticeAuditValue(input: NoticeAuditValueInput): Prisma.InputJsonObject {
  return {
    noticeId: input.noticeId,
    title: input.title,
    body: input.body,
    branchId: input.branchId,
    departmentId: input.departmentId,
    status: input.status,
    publishedAt: input.publishedAt?.toISOString() ?? null,
    expiresAt: input.expiresAt?.toISOString() ?? null,
    createdById: input.createdById,
  };
}

const noticeAuditSelect = {
  noticeId: true,
  title: true,
  body: true,
  branchId: true,
  departmentId: true,
  status: true,
  publishedAt: true,
  expiresAt: true,
  createdById: true,
} satisfies Prisma.NoticeSelect;

async function requireNoticeManager() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageNotices(session.role)) {
    return null;
  }

  return session;
}

export async function createNoticeAction(
  _previousState: NoticeActionState,
  formData: FormData,
): Promise<NoticeActionState> {
  const session = await requireNoticeManager();

  if (!session) {
    return {
      ok: false,
      message: "You do not have permission to manage notices.",
    };
  }

  const parsed = createNoticeValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const now = new Date();

  const createdNotice = await prisma.$transaction(async (tx) => {
    const notice = await tx.notice.create({
      data: {
        title: data.title,
        body: data.body,
        branchId: data.branchId,
        departmentId: data.departmentId,
        status: data.publishNow ? "PUBLISHED" : "DRAFT",
        publishedAt: data.publishNow ? now : null,
        expiresAt: data.expiresAt,
        createdById: session.userId,
      },
      select: noticeAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "NOTICE_CREATED",
        entityType: "notice",
        entityId: String(notice.noticeId),
        newValue: buildNoticeAuditValue(notice),
      },
    });

    return notice;
  });

  revalidatePath("/dashboard/notices");

  return {
    ok: true,
    message: `${createdNotice.title} created successfully.`,
  };
}

export async function publishNoticeAction(
  noticeId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const session = await requireNoticeManager();

  if (!session) {
    return;
  }

  const parsedNoticeId = parsePositiveId(noticeId);

  if (!parsedNoticeId) {
    return;
  }

  const existingNotice = await prisma.notice.findUnique({
    where: {
      noticeId: parsedNoticeId,
    },
    select: noticeAuditSelect,
  });

  if (!existingNotice) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const updatedNotice = await tx.notice.update({
      where: {
        noticeId: parsedNoticeId,
      },
      data: {
        status: "PUBLISHED",
        publishedAt: existingNotice.publishedAt ?? new Date(),
      },
      select: noticeAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "NOTICE_PUBLISHED",
        entityType: "notice",
        entityId: String(updatedNotice.noticeId),
        oldValue: buildNoticeAuditValue(existingNotice),
        newValue: buildNoticeAuditValue(updatedNotice),
      },
    });
  });

  revalidatePath("/dashboard/notices");
}

export async function unpublishNoticeAction(
  noticeId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const session = await requireNoticeManager();

  if (!session) {
    return;
  }

  const parsedNoticeId = parsePositiveId(noticeId);

  if (!parsedNoticeId) {
    return;
  }

  const existingNotice = await prisma.notice.findUnique({
    where: {
      noticeId: parsedNoticeId,
    },
    select: noticeAuditSelect,
  });

  if (!existingNotice) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const updatedNotice = await tx.notice.update({
      where: {
        noticeId: parsedNoticeId,
      },
      data: {
        status: "DRAFT",
      },
      select: noticeAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "NOTICE_UNPUBLISHED",
        entityType: "notice",
        entityId: String(updatedNotice.noticeId),
        oldValue: buildNoticeAuditValue(existingNotice),
        newValue: buildNoticeAuditValue(updatedNotice),
      },
    });
  });

  revalidatePath("/dashboard/notices");
}

export async function archiveNoticeAction(
  noticeId: string,
  formData: FormData,
): Promise<void> {
  void formData;

  const session = await requireNoticeManager();

  if (!session) {
    return;
  }

  const parsedNoticeId = parsePositiveId(noticeId);

  if (!parsedNoticeId) {
    return;
  }

  const existingNotice = await prisma.notice.findUnique({
    where: {
      noticeId: parsedNoticeId,
    },
    select: noticeAuditSelect,
  });

  if (!existingNotice) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const updatedNotice = await tx.notice.update({
      where: {
        noticeId: parsedNoticeId,
      },
      data: {
        status: "ARCHIVED",
      },
      select: noticeAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "NOTICE_ARCHIVED",
        entityType: "notice",
        entityId: String(updatedNotice.noticeId),
        oldValue: buildNoticeAuditValue(existingNotice),
        newValue: buildNoticeAuditValue(updatedNotice),
      },
    });
  });

  revalidatePath("/dashboard/notices");
}