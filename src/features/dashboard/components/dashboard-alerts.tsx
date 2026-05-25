const alerts = [
  {
    title: "Missing timeout",
    description:
      "Employees with time-in but no time-out will be shown here after attendance records are added.",
    badge: "MISSING_TIMEOUT",
  },
  {
    title: "Pending review",
    description:
      "Manual corrections, repeated scans, and exceptions will appear here for HR/Admin verification.",
    badge: "PENDING_REVIEW",
  },
  {
    title: "Birthday celebrators",
    description:
      "Today’s birthday celebrators will be listed here from employee profile records.",
    badge: "BIRTHDAYS",
  },
];

export function DashboardAlerts() {
  return (
    <section className="starland-card p-5">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Attendance Alerts
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Important attendance and employee notifications.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {alerts.map((alert) => (
          <div
            key={alert.title}
            className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4"
          >
            <span className="starland-badge starland-badge-warning">
              {alert.badge}
            </span>
            <h3 className="mt-3 text-sm font-extrabold text-[var(--starland-dark-text)]">
              {alert.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              {alert.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}