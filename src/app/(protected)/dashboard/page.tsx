import { DashboardAlerts } from "@/features/dashboard/components/dashboard-alerts";
import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";

export default function DashboardPage() {
  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          Admin / HR Dashboard
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Attendance Overview
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          Monitor employees, on-time records, late arrivals, pending reviews,
          missing time-outs, birthday celebrators, and recent system activity.
        </p>
      </div>

      <DashboardSummary />

      <DashboardAlerts />

      <section className="starland-card p-5">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Recent Logs
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Audit and attendance logs will appear here after database-backed
          queries are connected.
        </p>

        <div className="starland-scroll-x mt-4">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Employee</th>
                <th>Action</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>—</td>
                <td>No records yet</td>
                <td>Waiting for attendance data</td>
                <td>—</td>
                <td>
                  <span className="starland-badge starland-badge-info">
                    READY
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}