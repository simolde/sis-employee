import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  KeyRound,
  Network,
  Settings,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";
import { requireCanManageSettings } from "@/features/auth/server/permission-guards";

const settingsLinks = [
  {
    title: "Branches",
    description:
      "Manage school branches used for employees, notices, attendance, and reports.",
    href: "/dashboard/settings/branches",
    icon: Building2,
    enabled: true,
  },
  {
    title: "Departments",
    description:
      "Manage departments used for employee records, notices, and attendance filters.",
    href: "/dashboard/settings/departments",
    icon: Network,
    enabled: true,
  },
  {
    title: "Designations",
    description:
      "Manage employee job titles used in profiles, attendance, and HR reports.",
    href: "/dashboard/settings/designations",
    icon: BadgeCheck,
    enabled: true,
  },
  {
    title: "Employee Types",
    description:
      "Manage employment categories such as regular, probationary, ODL, and contractual.",
    href: "/dashboard/settings/employee-types",
    icon: UsersRound,
    enabled: true,
  },
  {
    title: "Shifts",
    description:
      "Manage shift start/end time, grace period, and overnight shift setup.",
    href: "/dashboard/settings/shifts",
    icon: Clock3,
    enabled: true,
  },
  {
    title: "Schedules",
    description:
      "Manage schedule records connected to shifts and employee assignments.",
    href: "/dashboard/settings/schedules",
    icon: CalendarDays,
    enabled: true,
  },
  {
    title: "Roles and Permissions",
    description: "Manage role-based access and permission rules. Coming soon.",
    href: "/dashboard/settings",
    icon: ShieldCheck,
    enabled: false,
  },
  {
    title: "User Accounts",
    description:
      "Manage login accounts, password resets, and account lockout. Coming soon.",
    href: "/dashboard/settings",
    icon: UserCog,
    enabled: false,
  },
  {
    title: "Security",
    description:
      "Review authentication, lockout, session settings, and security rules. Coming soon.",
    href: "/dashboard/settings",
    icon: KeyRound,
    enabled: false,
  },
];

export default async function SettingsPage() {
  await requireCanManageSettings();

  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          System Management
        </span>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Settings
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          Manage system setup, organization records, employment setup,
          schedules, security, and future configuration modules.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingsLinks.map((item) => {
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <article
                key={item.title}
                className="starland-card p-5 opacity-80"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                    {item.title}
                  </h2>

                  <span className="starland-badge starland-badge-warning">
                    Soon
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
                  {item.description}
                </p>
              </article>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>

              <h2 className="mt-4 text-lg font-extrabold text-[var(--starland-dark-text)]">
                {item.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>

      <section className="starland-card p-5">
        <div className="flex items-center gap-2">
          <Settings
            className="h-5 w-5 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Setup Reminder
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
          Configure branches, departments, designations, employee types, shifts,
          and schedules before adding employees and assigning attendance rules.
        </p>
      </section>
    </section>
  );
}