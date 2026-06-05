export type AbsenceGenerationActionState = {
  ok: boolean;
  message: string;
  generatedCount?: number;
  generatedAbsentCount?: number;
  generatedExcusedCount?: number;
  skippedCount?: number;
  checkedCount?: number;
  skippedByExceptionCount?: number;
  approvedLeaveCandidateCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAbsenceGenerationActionState: AbsenceGenerationActionState =
  {
    ok: false,
    message: "",
  };