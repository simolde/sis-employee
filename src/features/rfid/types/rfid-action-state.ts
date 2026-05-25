export type RfidActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialRfidActionState: RfidActionState = {
  ok: false,
  message: "",
};