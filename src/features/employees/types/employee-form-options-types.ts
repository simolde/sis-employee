export type EmployeeFormOption = {
  id: number;
  code: string;
  name: string;
  label: string;
};

export type EmployeeFormOptions = {
  branches: EmployeeFormOption[];
  departments: EmployeeFormOption[];
  designations: EmployeeFormOption[];
  employeeTypes: EmployeeFormOption[];
};