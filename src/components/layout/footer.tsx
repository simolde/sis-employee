export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--starland-border)] bg-white/55 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1 text-xs text-[var(--starland-muted-text)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} Starland International School, Inc. All rights reserved.
        </p>
        <p>Employee Attendance System</p>
      </div>
    </footer>
  );
}