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
  status: EmployeeStatusValue;

  sss: string;
  pagibig: string;
  philhealth: string;
  tin: string;
  img: string;

  fatherLastName: string;
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherAddress: string;
  fatherOccupation: string;

  motherLastName: string;
  motherFirstName: string;
  motherMiddleName: string;
  motherAddress: string;
  motherOccupation: string;

  spouseLastName: string;
  spouseFirstName: string;
  spouseMiddleName: string;
  spouseAddress: string;
  spouseOccupation: string;

  employer: string;
  employerAddress: string;
  employerPhone: string;

  child1FullName: string;
  child1DateOfBirth: string;
  child2FullName: string;
  child2DateOfBirth: string;
  child3FullName: string;
  child3DateOfBirth: string;

  elementarySchoolName: string;
  elementaryYearGraduated: string;
  elementaryAddress: string;

  secondarySchoolName: string;
  secondaryYearGraduated: string;
  secondaryAddress: string;

  vocationalSchoolName: string;
  vocationalYearGraduated: string;
  vocationalCourse: string;
  vocationalAddress: string;

  collegeSchoolName: string;
  collegeYearGraduated: string;
  collegeCourse: string;
  collegeAcademicHonors: string;
  collegeAddress: string;

  mastersSchoolName: string;
  mastersYear: string;
  mastersUnits: string;
  mastersAcademicHonors: string;
  mastersAddress: string;

  doctorateSchoolName: string;
  doctorateYear: string;
  doctorateUnits: string;
  doctorateAcademicHonors: string;
  doctorateAddress: string;

  letPasser: boolean;

  work1Company: string;
  work1Position: string;
  work1InclusiveDates: string;
  work2Company: string;
  work2Position: string;
  work2InclusiveDates: string;
  work3Company: string;
  work3Position: string;
  work3InclusiveDates: string;

  dateHired: string;
  dateOfJoining: string;
  signature: string;
  dateSigned: string;
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

export type EmployeeFamilyBackgroundDetail = {
  fatherFullName: string;
  fatherAddress: string;
  fatherOccupation: string;
  motherFullName: string;
  motherAddress: string;
  motherOccupation: string;
  spouseFullName: string;
  spouseAddress: string;
  spouseOccupation: string;
  employer: string;
  employerAddress: string;
  employerPhone: string;
};

export type EmployeeChildDetail = {
  fullName: string;
  dateOfBirth: string;
};

export type EmployeeEducationalBackgroundDetail = {
  level: string;
  schoolName: string;
  yearGraduated: string;
  course: string;
  units: string;
  academicHonors: string;
  address: string;
};

export type EmployeeEducationDetail = {
  letPasser: boolean;
  backgrounds: EmployeeEducationalBackgroundDetail[];
};

export type EmployeeWorkExperienceDetail = {
  company: string;
  position: string;
  inclusiveDates: string;
};

export type EmployeeContractDetail = {
  dateHired: string;
  dateOfJoining: string;
  signature: string;
  dateSigned: string;
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
  familyBackground: EmployeeFamilyBackgroundDetail;
  children: EmployeeChildDetail[];
  education: EmployeeEducationDetail;
  workExperiences: EmployeeWorkExperienceDetail[];
  contract: EmployeeContractDetail | null;
};