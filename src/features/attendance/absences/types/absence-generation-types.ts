export type AbsenceGenerationActionState = {
  ok: boolean;
  message: string;
  generatedCount?: number;
  skippedCount?: number;
  checkedCount?: number;
  skippedByExceptionCount?: number;
  skippedByApprovedLeaveCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAbsenceGenerationActionState: AbsenceGenerationActionState =
  {
    ok: false,
    message: "",
  };