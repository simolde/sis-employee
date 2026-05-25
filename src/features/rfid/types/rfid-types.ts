export type RfidEmployeeOption = {
  empId: number;
  empNumber: string;
  fullName: string;
  departmentName: string;
  branchName: string;
};

export type RfidCardListItem = {
  rfidId: number;
  rfidUid: string;
  employeeName: string;
  empNumber: string;
  departmentName: string;
  branchName: string;
  status: string;
  assignedAt: string;
  disabledAt: string;
  remarks: string;
};

export type RfidPageData = {
  employees: RfidEmployeeOption[];
  rfidCards: RfidCardListItem[];
};