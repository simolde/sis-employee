import type { Prisma } from "@/generated/prisma/client";

type AttendanceReviewLogSource = {
  punchType: string;
  source: string | null;
};

export function buildAttendanceReviewRequiredWhere(): Prisma.AttendanceWhereInput {
  return {
    OR: [
      {
        isManual: true,
      },
      {
        inSource: "MANUAL",
      },
      {
        outSource: "MANUAL",
      },
      {
        logs: {
          some: {
            source: "MANUAL",
            punchType: {
              in: ["MANUAL_EDIT", "CORRECTION"],
            },
          },
        },
      },
    ],
  };
}

export function isAttendanceReviewRequired(input: {
  isManual: boolean;
  inSource: string | null;
  outSource: string | null;
  logs: AttendanceReviewLogSource[];
}): boolean {
  if (input.isManual) {
    return true;
  }

  if (input.inSource === "MANUAL" || input.outSource === "MANUAL") {
    return true;
  }

  return input.logs.some(
    (log) =>
      log.source === "MANUAL" &&
      (log.punchType === "MANUAL_EDIT" || log.punchType === "CORRECTION"),
  );
}