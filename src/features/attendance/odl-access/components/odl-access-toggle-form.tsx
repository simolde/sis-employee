"use client";

import { useActionState } from "react";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { updateOdlAccessAction } from "../server/odl-access-actions";
import {
  initialOdlAccessActionState,
  type OdlAccessEmployeeItem,
} from "../types/odl-access-types";

type OdlAccessToggleFormProps = {
  employee: OdlAccessEmployeeItem;
};

export function OdlAccessToggleForm({
  employee,
}: OdlAccessToggleFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateOdlAccessAction,
    initialOdlAccessActionState,
  );

  const nextValue = !employee.isFlexible;

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input type="hidden" name="empId" value={employee.empId} />
        <input type="hidden" name="nextValue" value={String(nextValue)} />

        <button
          type="submit"
          className={[
            "starland-btn starland-btn-sm",
            employee.isFlexible
              ? "starland-btn-soft"
              : "starland-btn-primary",
          ].join(" ")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : employee.isFlexible ? (
            <ShieldX className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          )}

          {employee.isFlexible ? "Disable ODL" : "Enable ODL"}
        </button>
      </form>

      {state.message ? (
        <p
          className={[
            "max-w-56 text-xs font-semibold",
            state.ok
              ? "text-[var(--starland-success)]"
              : "text-[var(--starland-danger)]",
          ].join(" ")}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}