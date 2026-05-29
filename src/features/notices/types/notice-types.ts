export const noticeStatusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const noticeAudienceValues = [
  "ALL",
  "HR_ADMIN",
  "HEADS",
  "STAFF_FACULTY_MAINTENANCE",
] as const;

export type NoticeStatusValue = (typeof noticeStatusValues)[number];
export type NoticeAudienceValue = (typeof noticeAudienceValues)[number];

export type NoticeStatusFilterValue = "ANY" | NoticeStatusValue;
export type NoticeAudienceFilterValue = "ANY" | NoticeAudienceValue;

export type NoticeListSearchParams = {
  q: string;
  status: NoticeStatusFilterValue;
  audience: NoticeAudienceFilterValue;
  page: number;
  pageSize: number;
};

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
  audience: NoticeAudienceValue;
  branchName: string;
  departmentName: string;
  status: NoticeStatusValue;
  publishedAt: string;
  expiresAt: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type NoticeEditData = {
  noticeId: number;
  title: string;
  body: string;
  audience: NoticeAudienceValue;
  branchId: number | null;
  departmentId: number | null;
  expiresAtInput: string;
  status: NoticeStatusValue;
  branchOptions: NoticeTargetOption[];
  departmentOptions: NoticeTargetOption[];
};

export type NoticeReadReportItem = {
  userId: number;
  username: string;
  email: string;
  employeeName: string;
  roleName: string;
  branchName: string;
  departmentName: string;
  hasRead: boolean;
  readAt: string;
};

export type NoticeReadReportData = {
  notice: {
    noticeId: number;
    title: string;
    audience: NoticeAudienceValue;
    branchName: string;
    departmentName: string;
    status: NoticeStatusValue;
    publishedAt: string;
    expiresAt: string;
  };
  recipients: NoticeReadReportItem[];
  summary: {
    totalRecipients: number;
    totalRead: number;
    totalUnread: number;
    readPercentage: number;
  };
};

export type NoticePageData = {
  canManage: boolean;
  branchOptions: NoticeTargetOption[];
  departmentOptions: NoticeTargetOption[];
  notices: NoticeListItem[];
  filters: NoticeListSearchParams;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  summary: {
    total: number;
    draft: number;
    published: number;
    archived: number;
  };
};