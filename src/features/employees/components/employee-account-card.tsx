"use client";

import { useActionState } from "react";
import {
  KeyRound,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Unlock,
  UserCog,
} from "lucide-react";
import type {
  EmployeeAccountDetail,
  EmployeeDetail,
} from "../types/employee-types";
import {
  createEmployeeAccountAction,
  initialEmployeeAccountActionState,
  resetEmployeePasswordAction,
  unlockEmployeeAccountAction,
} from "../server/account-actions";

type EmployeeAccountCardProps = {
  employee: EmployeeDetail;
};

type ExistingAccountActionsProps = {
  employeeId: number;
  account: EmployeeAccountDetail;
};

type FieldErrorProps = {
  messages?: string[];
};

function FieldError({ messages }: FieldErrorProps) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

function ActionMessage({
  ok,
  message,
}: {
  ok: boolean;
  message: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={[
        "mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
        ok
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700",
      ].join(" ")}
    >
      {message}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "starland-badge",
        active ? "starland-badge-success" : "starland-badge-danger",
      ].join(" ")}
    >
      {active ? "Good" : "Needs Action"}
    </span>
  );
}

function CreateAccountForm({ employee }: EmployeeAccountCardProps) {
  const createAction = createEmployeeAccountAction.bind(
    null,
    String(employee.profile.empId),
  );

  const [state, formAction, isPending] = useActionState(
    createAction,
    initialEmployeeAccountActionState,
  );

  const suggestedUsername = employee.profile.empNumber.toLowerCase();
  const suggestedEmail =
    employee.profile.email === "—" ? "" : employee.profile.email;

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <ActionMessage ok={state.ok} message={state.message} />

      <div>
        <label
          htmlFor="username"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          className="starland-input mt-2"
          defaultValue={suggestedUsername}
          disabled={isPending}
        />
        <FieldError messages={state.fieldErrors?.username} />
      </div>

      <div>
        <label
          htmlFor="email"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Login Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="starland-input mt-2"
          defaultValue={suggestedEmail}
          disabled={isPending}
        />
        <FieldError messages={state.fieldErrors?.email} />
      </div>

      <div>
        <label
          htmlFor="roleId"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Role
        </label>
        <select
          id="roleId"
          name="roleId"
          className="starland-input mt-2"
          defaultValue=""
          disabled={isPending}
        >
          <option value="">Select role</option>
          {employee.accountRoleOptions.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.roleId} />
      </div>

      <div>
        <label
          htmlFor="temporaryPassword"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Temporary Password
        </label>
        <input
          id="temporaryPassword"
          name="temporaryPassword"
          type="password"
          className="starland-input mt-2"
          placeholder="At least 8 characters"
          disabled={isPending}
        />
        <FieldError messages={state.fieldErrors?.temporaryPassword} />
        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          Password must contain uppercase, lowercase, and number.
        </p>
      </div>

      <button
        type="submit"
        className="starland-btn starland-btn-primary w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Creating Account...
          </>
        ) : (
          <>
            <UserCog className="h-4 w-4" aria-hidden="true" />
            Create Login Account
          </>
        )}
      </button>
    </form>
  );
}

function ResetPasswordForm({ employeeId, account }: ExistingAccountActionsProps) {
  const resetAction = resetEmployeePasswordAction.bind(
    null,
    String(account.userId),
    String(employeeId),
  );

  const [resetState, resetFormAction, isResetPending] = useActionState(
    resetAction,
    initialEmployeeAccountActionState,
  );

  return (
    <form
      action={resetFormAction}
      className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
    >
      <h3 className="text-sm font-extrabold text-[var(--starland-dark-text)]">
        Reset Password
      </h3>
      <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
        This sets a new temporary password, unlocks the account, clears failed
        attempts, and forces password change on next login.
      </p>

      <div className="mt-4">
        <label
          htmlFor="resetTemporaryPassword"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          New Temporary Password
        </label>
        <input
          id="resetTemporaryPassword"
          name="temporaryPassword"
          type="password"
          className="starland-input mt-2"
          disabled={isResetPending}
        />
        <FieldError messages={resetState.fieldErrors?.temporaryPassword} />
      </div>

      <ActionMessage ok={resetState.ok} message={resetState.message} />

      <button
        type="submit"
        className="starland-btn starland-btn-secondary mt-4 w-full"
        disabled={isResetPending}
      >
        {isResetPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Resetting...
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset Password
          </>
        )}
      </button>
    </form>
  );
}

function UnlockAccountForm({
  employeeId,
  account,
}: ExistingAccountActionsProps) {
  const unlockAction = unlockEmployeeAccountAction.bind(
    null,
    String(account.userId),
    String(employeeId),
  );

  const [unlockState, unlockFormAction, isUnlockPending] = useActionState(
    unlockAction,
    initialEmployeeAccountActionState,
  );

  return (
    <form
      action={unlockFormAction}
      className="rounded-2xl border border-[var(--starland-border)] p-4"
    >
      <h3 className="text-sm font-extrabold text-[var(--starland-dark-text)]">
        Unlock Account
      </h3>
      <p className="mt-1 text-xs leading-5 text-[var(--starland-muted-text)]">
        Clears failed attempts and removes temporary lockout.
      </p>

      <ActionMessage ok={unlockState.ok} message={unlockState.message} />

      <button
        type="submit"
        className="starland-btn starland-btn-soft mt-4 w-full"
        disabled={isUnlockPending}
      >
        {isUnlockPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Unlocking...
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" aria-hidden="true" />
            Unlock Account
          </>
        )}
      </button>
    </form>
  );
}

function ExistingAccountActions({
  employeeId,
  account,
}: ExistingAccountActionsProps) {
  return (
    <div className="mt-5 space-y-5">
      <ResetPasswordForm employeeId={employeeId} account={account} />
      <UnlockAccountForm employeeId={employeeId} account={account} />
    </div>
  );
}

export function EmployeeAccountCard({ employee }: EmployeeAccountCardProps) {
  const account = employee.account;

  if (!account) {
    return (
      <section className="starland-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Login Account
            </h2>
            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              No login account has been created for this employee yet.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[var(--starland-warning)]">
            <UserCog className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>

        <CreateAccountForm employee={employee} />
      </section>
    );
  }

  return (
    <section className="starland-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Login Account
          </h2>
          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Account security, role assignment, password reset, and lockout
            controls.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[var(--starland-success)]">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
            Username
          </p>
          <p className="mt-1 text-sm font-extrabold text-[var(--starland-dark-text)]">
            {account.username}
          </p>
          <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
            {account.email}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--starland-border)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Role
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--starland-dark-text)]">
              {account.roleName}
            </p>
            <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
              {account.roleCode}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Status
            </p>
            <div className="mt-2">
              <StatusBadge active={account.status === "ACTIVE"} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-2xl border border-[var(--starland-border)] p-4">
            <KeyRound
              className="mt-0.5 h-5 w-5 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-bold text-[var(--starland-dark-text)]">
                Must Change Password
              </p>
              <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                {account.mustChangePassword ? "Required" : "Not required"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-[var(--starland-border)] p-4">
            <Lock
              className="mt-0.5 h-5 w-5 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-bold text-[var(--starland-dark-text)]">
                Lock Status
              </p>
              <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                {account.isLocked
                  ? `Locked until ${account.lockoutUntil}`
                  : "Not locked"}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--starland-muted-text)]">
          Failed attempts: {account.failedAttempts} · Last login:{" "}
          {account.lastLoginAt}
        </p>
      </div>

      <ExistingAccountActions
        employeeId={employee.profile.empId}
        account={account}
      />
    </section>
  );
}