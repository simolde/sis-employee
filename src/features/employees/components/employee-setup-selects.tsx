import type { EmployeeFormOptions } from "../types/employee-form-options-types";

type EmployeeSetupSelectsProps = {
  options: EmployeeFormOptions;
  defaultValues?: {
    branchId?: number | null;
    departmentId?: number | null;
    designationId?: number | null;
    empTypeId?: number | null;
    scheduleId?: number | null;
    isFlexible?: boolean | null;
  };
  disabled?: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-semibold text-[var(--starland-danger)]">
      {messages[0]}
    </p>
  );
}

export function EmployeeSetupSelects({
  options,
  defaultValues,
  disabled = false,
  fieldErrors,
}: EmployeeSetupSelectsProps) {
  return (
    <section className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div>
        <h2 className="text-base font-extrabold text-[var(--starland-dark-text)]">
          Work Assignment
        </h2>

        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Select active records from Settings. Add missing options from Settings
          first.
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label
            htmlFor="branchId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Branch
          </label>

          <select
            id="branchId"
            name="branchId"
            className="starland-input mt-2"
            defaultValue={defaultValues?.branchId ?? ""}
            disabled={disabled}
          >
            <option value="">Select branch</option>
            {options.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.label}
              </option>
            ))}
          </select>

          <FieldError messages={fieldErrors?.branchId} />
        </div>

        <div>
          <label
            htmlFor="departmentId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Department
          </label>

          <select
            id="departmentId"
            name="departmentId"
            className="starland-input mt-2"
            defaultValue={defaultValues?.departmentId ?? ""}
            disabled={disabled}
          >
            <option value="">Select department</option>
            {options.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.label}
              </option>
            ))}
          </select>

          <FieldError messages={fieldErrors?.departmentId} />
        </div>

        <div>
          <label
            htmlFor="designationId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Designation
          </label>

          <select
            id="designationId"
            name="designationId"
            className="starland-input mt-2"
            defaultValue={defaultValues?.designationId ?? ""}
            disabled={disabled}
          >
            <option value="">Select designation</option>
            {options.designations.map((designation) => (
              <option key={designation.id} value={designation.id}>
                {designation.label}
              </option>
            ))}
          </select>

          <FieldError messages={fieldErrors?.designationId} />
        </div>

        <div>
          <label
            htmlFor="empTypeId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Employee Type
          </label>

          <select
            id="empTypeId"
            name="empTypeId"
            className="starland-input mt-2"
            defaultValue={defaultValues?.empTypeId ?? ""}
            disabled={disabled}
          >
            <option value="">Select employee type</option>
            {options.employeeTypes.map((employeeType) => (
              <option key={employeeType.id} value={employeeType.id}>
                {employeeType.label}
              </option>
            ))}
          </select>

          <FieldError messages={fieldErrors?.empTypeId} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <label
            htmlFor="scheduleId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Current Schedule
          </label>

          <select
            id="scheduleId"
            name="scheduleId"
            className="starland-input mt-2"
            defaultValue={defaultValues?.scheduleId ?? ""}
            disabled={disabled}
          >
            <option value="">No fixed schedule / assign later</option>
            {options.schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.label}
              </option>
            ))}
          </select>

          <FieldError messages={fieldErrors?.scheduleId} />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--starland-dark-text)]">
          <input
            type="checkbox"
            name="isFlexible"
            defaultChecked={Boolean(defaultValues?.isFlexible)}
            disabled={disabled}
          />
          Flexible Schedule
        </label>
      </div>
    </section>
  );
}