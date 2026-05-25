"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, LockKeyhole, LogIn } from "lucide-react";
import type { LoginResponse } from "../types/auth-types";

export function LoginForm() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setRemainingSeconds(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.message || "Login failed.");
        setRemainingSeconds(data.remainingSeconds ?? null);
        return;
      }

      router.replace(data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setMessage("Unable to login. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <p>{message}</p>
          {remainingSeconds !== null ? (
            <p className="mt-1 text-xs">
              Try again in about {remainingSeconds} second
              {remainingSeconds === 1 ? "" : "s"}.
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="login"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Username or Email
        </label>
        <input
          id="login"
          name="login"
          className="starland-input mt-2"
          placeholder="admin or it@starland.edu.ph"
          autoComplete="username"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          className="starland-input mt-2"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        className="starland-btn starland-btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign In
          </>
        )}
      </button>

      <div className="flex items-start gap-2 rounded-2xl bg-[var(--starland-modern-bg)] p-4 text-xs leading-5 text-[var(--starland-muted-text)]">
        <LockKeyhole
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--starland-main-green)]"
          aria-hidden="true"
        />
        <p>
          Login data is sent securely through a POST request and never appears in
          the URL.
        </p>
      </div>
    </form>
  );
}