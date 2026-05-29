import type { NoticeAudienceValue } from "./notice-types";

export type TopbarNoticeItem = {
  noticeId: number;
  title: string;
  bodyPreview: string;
  audience: NoticeAudienceValue;
  branchName: string;
  departmentName: string;
  publishedAt: string;
  expiresAt: string;
};

export type TopbarNoticeResponse = {
  ok: boolean;
  notices: TopbarNoticeItem[];
};