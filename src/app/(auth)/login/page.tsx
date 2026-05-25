import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentSession } from "@/features/auth/server/session";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="starland-page flex min-h-screen items-center justify-center">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-[var(--starland-border)] bg-white shadow-2xl lg:grid-cols-[1fr_1.1fr]">
        <div className="bg-[var(--starland-deep-green)] p-8 text-white sm:p-10">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Starland Attendance
          </span>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Secure employee attendance and HR access.
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/70">
            Sign in using your username or email. Failed attempts are monitored
            and temporary account lockout is applied for security.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-bold">Security enabled</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Passwords are verified using bcryptjs.</li>
              <li>• Sessions use secure HTTP-only cookies.</li>
              <li>• Login data is never placed in the URL.</li>
            </ul>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold text-[var(--starland-dark-text)]">
            Login
          </h2>
          <p className="mt-2 text-sm text-[var(--starland-muted-text)]">
            Enter your Starland Attendance account credentials.
          </p>

          <LoginForm />

          <Link
            href="/"
            className="mt-6 inline-flex text-sm font-bold text-[var(--starland-main-green)]"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}