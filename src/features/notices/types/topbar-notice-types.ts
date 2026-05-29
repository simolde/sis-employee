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
  isRead: boolean;
};

export type TopbarNoticeResponse = {
  ok: boolean;
  unreadCount: number;
  notices: TopbarNoticeItem[];
};

export type MarkTopbarNoticesReadResponse = {
  ok: boolean;
  unreadCount: number;
};