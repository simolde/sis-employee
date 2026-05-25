export const employeeStatusValues = [
  "ACTIVE",
  "INACTIVE",
  "RESIGNED",
  "TERMINATED",
  "ON_LEAVE",
] as const;

export type EmployeeStatusValue = (typeof employeeStatusValues)[number];

export type EmployeeStatusFilterValue = "ALL" | EmployeeStatusValue;

export type EmployeeListSearchParams = {
  q: string;
  status: EmployeeStatusFilterValue;
  page: number;
  pageSize: number;
};

export type EmployeeListItem = {
  empId: number;
  empNumber: string;
  fullName: string;
  email: string;
  phone: string;
  branchName: string;
  departmentName: string;
  designationName: string;
  status: EmployeeStatusValue;
  dateHired: string;
};

export type EmployeeListSummary = {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
};

export type EmployeeListResult = {
  employees: EmployeeListItem[];
  summary: EmployeeListSummary;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  filters: EmployeeListSearchParams;
};

export type EmployeeFormOption = {
  value: string;
  label: string;
};

export type EmployeeFormOptions = {
  branches: EmployeeFormOption[];
  departments: EmployeeFormOption[];
  designations: EmployeeFormOption[];
  empTypes: EmployeeFormOption[];
  schedules: EmployeeFormOption[];
};

export type EmployeeEditFormData = {
  empId: number;
  empNumber: string;
  prc: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: string;
  dob: string;
  pob: string;
  email: string;
  phone: string;
  landline: string;
  civilStatus: string;
  citizenship: string;
  address: string;
  branchId: string;
  departmentId: string;
  designationId: string;
  empTypeId: string;
  scheduleId: string;
  isFlexible: boolean;
  avLeave: string;
  sss: string;
  pagibig: string;
  philhealth: string;
  tin: string;
  img: string;
  dateHired: string;
  dateSigned: string;
  status: EmployeeStatusValue;
};

export type EmployeeEditData = {
  employee: EmployeeEditFormData;
  options: EmployeeFormOptions;
};

export type EmployeeAccountRoleOption = {
  value: string;
  label: string;
  code: string;
};

export type EmployeeAccountDetail = {
  userId: number;
  username: string;
  email: string;
  roleName: string;
  roleCode: string;
  status: string;
  mustChangePassword: boolean;
  failedAttempts: number;
  isLocked: boolean;
  lockoutUntil: string;
  lastLoginAt: string;
};

export type EmployeeRfidDetail = {
  rfidId: number;
  rfidUid: string;
  status: string;
  assignedAt: string;
  disabledAt: string;
  remarks: string;
};

export type EmployeeAttendanceSummary = {
  totalRecords: number;
  onTime: number;
  late: number;
  pendingReview: number;
  missingTimeout: number;
};

export type EmployeeRecentAttendance = {
  attendanceId: number;
  attDate: string;
  timeIn: string;
  timeOut: string;
  status: string;
  totalHours: string;
  source: string;
  branch: string;
};

export type EmployeeDetail = {
  profile: {
    empId: number;
    empNumber: string;
    fullName: string;
    prc: string;
    gender: string;
    dob: string;
    pob: string;
    email: string;
    phone: string;
    landline: string;
    civilStatus: string;
    citizenship: string;
    address: string;
    branchName: string;
    departmentName: string;
    designationName: string;
    empTypeName: string;
    scheduleName: string;
    shiftTime: string;
    isFlexible: boolean;
    avLeave: number;
    sss: string;
    pagibig: string;
    philhealth: string;
    tin: string;
    img: string | null;
    dateHired: string;
    dateSigned: string;
    status: EmployeeStatusValue;
    createdAt: string;
    updatedAt: string;
  };
  account: EmployeeAccountDetail | null;
  accountRoleOptions: EmployeeAccountRoleOption[];
  rfidCards: EmployeeRfidDetail[];
  attendanceSummary: EmployeeAttendanceSummary;
  recentAttendance: EmployeeRecentAttendance[];
};