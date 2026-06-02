"use client";

import { useActionState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { markMissingTimeoutsAction } from "../server/missing-timeout-actions";
import { initialMissingTimeoutActionState } from "../types/missing-timeout-types";

type MissingTimeoutActionsProps = {
  candidateCount: number;
};

export function MissingTimeoutActions({
  candidateCount,
}: MissingTimeoutActionsProps) {
  const [state, formAction, isPending] = useActionState(
    markMissingTimeoutsAction,
    initialMissingTimeoutActionState,
  );

  return (
    <div className="space-y-3">
      {state.message ? (
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-semibold",
            state.ok
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {state.message}
        </div>
      ) : null}

      <form action={formAction}>
        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={isPending || candidateCount === 0}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          )}
          Mark Missing Time-outs
        </button>
      </form>
    </div>
  );
}