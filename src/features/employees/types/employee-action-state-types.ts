export type CreateEmployeeActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type UpdateEmployeeActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialCreateEmployeeActionState: CreateEmployeeActionState = {
  ok: false,
  message: "",
};

export const initialUpdateEmployeeActionState: UpdateEmployeeActionState = {
  ok: false,
  message: "",
};