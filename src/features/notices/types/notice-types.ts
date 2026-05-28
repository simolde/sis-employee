export const noticeStatusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type NoticeStatusValue = (typeof noticeStatusValues)[number];

export type NoticeActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialNoticeActionState: NoticeActionState = {
  ok: false,
  message: "",
};

export type NoticeTargetOption = {
  id: number;
  name: string;
};

export type NoticeListItem = {
  noticeId: number;
  title: string;
  body: string;
  branchName: string;
  departmentName: string;
  status: NoticeStatusValue;
  publishedAt: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type NoticePageData = {
  canManage: boolean;
  branchOptions: NoticeTargetOption[];
  departmentOptions: NoticeTargetOption[];
  notices: NoticeListItem[];
  summary: {
    total: number;
    draft: number;
    published: number;
    archived: number;
  };
};