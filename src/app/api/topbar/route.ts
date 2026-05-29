import { NextResponse } from "next/server";
import { getTopbarNotices } from "@/features/notices/server/topbar-notice-queries";
import type { TopbarNoticeResponse } from "@/features/notices/types/topbar-notice-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const notices = await getTopbarNotices();

  const response: TopbarNoticeResponse = {
    ok: true,
    notices,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}