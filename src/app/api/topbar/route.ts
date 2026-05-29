import { NextResponse } from "next/server";
import {
  getTopbarNoticeData,
  markTopbarNoticesAsRead,
} from "@/features/notices/server/topbar-notice-queries";
import type {
  MarkTopbarNoticesReadResponse,
  TopbarNoticeResponse,
} from "@/features/notices/types/topbar-notice-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const response: TopbarNoticeResponse = await getTopbarNoticeData();

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    noticeIds?: unknown;
  } | null;

  const noticeIds = Array.isArray(body?.noticeIds)
    ? body.noticeIds
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    : [];

  const unreadCount = await markTopbarNoticesAsRead(noticeIds);

  const response: MarkTopbarNoticesReadResponse = {
    ok: true,
    unreadCount,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}