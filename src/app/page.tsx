import Link from "next/link";

export default function HomePage() {
  return (
    <main className="starland-page flex min-h-screen items-center justify-center">
      <section className="starland-card w-full max-w-3xl p-6 text-center sm:p-10">
        <span className="starland-badge starland-badge-success">
          Starland Attendance
        </span>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[var(--starland-dark-text)] sm:text-5xl">
          Employee Attendance System
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--starland-muted-text)] sm:text-base">
          Secure attendance, employee records, RFID assignment, leave
          management, notices, and audit logs for Starland International School,
          Inc.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login" className="starland-btn starland-btn-primary">
            Go to Login
          </Link>
          <Link href="/dashboard" className="starland-btn starland-btn-secondary">
            View Dashboard Shell
          </Link>
        </div>
      </section>
    </main>
  );
}