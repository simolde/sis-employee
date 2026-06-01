export type EmployeeScheduleHistoryEmployee = {
  empId: number;
  empNumber: string;
  fullName: string;
  branchName: string;
  departmentName: string;
  designationName: string;
  currentScheduleName: string;
  currentScheduleCode: string;
  currentShiftName: string;
  currentShiftTime: string;
};

export type EmployeeScheduleHistoryItem = {
  assignmentId: number;
  scheduleCode: string;
  scheduleName: string;
  shiftCode: string;
  shiftName: string;
  shiftTime: string;
  daysOfWeek: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  assignedBy: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeScheduleHistoryData = {
  employee: EmployeeScheduleHistoryEmployee;
  assignments: EmployeeScheduleHistoryItem[];
  summary: {
    totalAssignments: number;
    activeAssignments: number;
    inactiveAssignments: number;
  };
};