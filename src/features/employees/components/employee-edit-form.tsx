"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  initialUpdateEmployeeActionState,
  updateEmployeeAction,
} from "../server/employee-actions";
import {
  employeeStatusValues,
  type EmployeeEditFormData,
  type EmployeeFormOptions,
} from "../types/employee-types";

type EmployeeEditFormProps = {
  employee: EmployeeEditFormData;
  options: EmployeeFormOptions;
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

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[var(--starland-border)] pb-3">
      <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
        {description}
      </p>
    </div>
  );
}

export function EmployeeEditForm({
  employee,
  options,
}: EmployeeEditFormProps) {
  const updateAction = updateEmployeeAction.bind(null, String(employee.empId));

  const [state, formAction, isPending] = useActionState(
    updateAction,
    initialUpdateEmployeeActionState,
  );

  return (
    <form action={formAction} className="starland-card space-y-8 p-5 sm:p-6">
      {state.message ? (
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-semibold",
            state.ok
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {state.message}
        </div>
      ) : null}

      <section className="space-y-4">
        <SectionTitle
          title="Basic Information"
          description="Update employee profile and personal information."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="empNumber"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Employee Number
            </label>
            <input
              id="empNumber"
              name="empNumber"
              className="starland-input mt-2"
              defaultValue={employee.empNumber}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.empNumber} />
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              className="starland-input mt-2"
              defaultValue={employee.firstName}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.firstName} />
          </div>

          <div>
            <label
              htmlFor="middleName"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Middle Name
            </label>
            <input
              id="middleName"
              name="middleName"
              className="starland-input mt-2"
              defaultValue={employee.middleName}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.middleName} />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              className="starland-input mt-2"
              defaultValue={employee.lastName}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.lastName} />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              className="starland-input mt-2"
              defaultValue={employee.gender}
              disabled={isPending}
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <FieldError messages={state.fieldErrors?.gender} />
          </div>

          <div>
            <label
              htmlFor="dob"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              className="starland-input mt-2"
              defaultValue={employee.dob}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.dob} />
          </div>

          <div>
            <label
              htmlFor="pob"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Place of Birth
            </label>
            <input
              id="pob"
              name="pob"
              className="starland-input mt-2"
              defaultValue={employee.pob}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.pob} />
          </div>

          <div>
            <label
              htmlFor="civilStatus"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Civil Status
            </label>
            <input
              id="civilStatus"
              name="civilStatus"
              className="starland-input mt-2"
              defaultValue={employee.civilStatus}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.civilStatus} />
          </div>

          <div>
            <label
              htmlFor="citizenship"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Citizenship
            </label>
            <input
              id="citizenship"
              name="citizenship"
              className="starland-input mt-2"
              defaultValue={employee.citizenship}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.citizenship} />
          </div>
        </div>

        <div>
          <label
            htmlFor="address"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            className="starland-input mt-2 min-h-24 resize-y"
            defaultValue={employee.address}
            disabled={isPending}
          />
          <FieldError messages={state.fieldErrors?.address} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Contact Information"
          description="Update employee email and phone details."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="starland-input mt-2"
              defaultValue={employee.email}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.email} />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              className="starland-input mt-2"
              defaultValue={employee.phone}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.phone} />
          </div>

          <div>
            <label
              htmlFor="landline"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Landline
            </label>
            <input
              id="landline"
              name="landline"
              className="starland-input mt-2"
              defaultValue={employee.landline}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.landline} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Work Information"
          description="Update branch, department, designation, employee type, and schedule."
        />

        <div className="grid gap-4 md:grid-cols-3">
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
              defaultValue={employee.branchId}
              disabled={isPending}
            >
              <option value="">Select branch</option>
              {options.branches.map((branch) => (
                <option key={branch.value} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.branchId} />
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
              defaultValue={employee.departmentId}
              disabled={isPending}
            >
              <option value="">Select department</option>
              {options.departments.map((department) => (
                <option key={department.value} value={department.value}>
                  {department.label}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.departmentId} />
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
              defaultValue={employee.designationId}
              disabled={isPending}
            >
              <option value="">Select designation</option>
              {options.designations.map((designation) => (
                <option key={designation.value} value={designation.value}>
                  {designation.label}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.designationId} />
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
              defaultValue={employee.empTypeId}
              disabled={isPending}
            >
              <option value="">Select employee type</option>
              {options.empTypes.map((empType) => (
                <option key={empType.value} value={empType.value}>
                  {empType.label}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.empTypeId} />
          </div>

          <div>
            <label
              htmlFor="scheduleId"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Schedule
            </label>
            <select
              id="scheduleId"
              name="scheduleId"
              className="starland-input mt-2"
              defaultValue={employee.scheduleId}
              disabled={isPending}
            >
              <option value="">Select schedule</option>
              {options.schedules.map((schedule) => (
                <option key={schedule.value} value={schedule.value}>
                  {schedule.label}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.scheduleId} />
          </div>

          <div>
            <label
              htmlFor="status"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              className="starland-input mt-2"
              defaultValue={employee.status}
              disabled={isPending}
            >
              {employeeStatusValues.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.status} />
          </div>

          <div>
            <label
              htmlFor="dateHired"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Date Hired
            </label>
            <input
              id="dateHired"
              name="dateHired"
              type="date"
              className="starland-input mt-2"
              defaultValue={employee.dateHired}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.dateHired} />
          </div>

          <div>
            <label
              htmlFor="dateSigned"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Date Signed
            </label>
            <input
              id="dateSigned"
              name="dateSigned"
              type="date"
              className="starland-input mt-2"
              defaultValue={employee.dateSigned}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.dateSigned} />
          </div>

          <div>
            <label
              htmlFor="avLeave"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Available Leave
            </label>
            <input
              id="avLeave"
              name="avLeave"
              type="number"
              step="0.5"
              min="0"
              className="starland-input mt-2"
              defaultValue={employee.avLeave}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.avLeave} />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <input
            name="isFlexible"
            type="checkbox"
            className="h-4 w-4 accent-[var(--starland-main-green)]"
            defaultChecked={employee.isFlexible}
            disabled={isPending}
          />
          <span>
            <span className="block text-sm font-bold text-[var(--starland-dark-text)]">
              Flexible schedule
            </span>
            <span className="block text-xs text-[var(--starland-muted-text)]">
              Enable this if the employee does not strictly follow the assigned
              shift start and end time.
            </span>
          </span>
        </label>
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Government and Other Details"
          description="Optional employee identification and profile image path."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="prc"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              PRC
            </label>
            <input
              id="prc"
              name="prc"
              className="starland-input mt-2"
              defaultValue={employee.prc}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.prc} />
          </div>

          <div>
            <label
              htmlFor="sss"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              SSS
            </label>
            <input
              id="sss"
              name="sss"
              className="starland-input mt-2"
              defaultValue={employee.sss}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.sss} />
          </div>

          <div>
            <label
              htmlFor="pagibig"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Pag-IBIG
            </label>
            <input
              id="pagibig"
              name="pagibig"
              className="starland-input mt-2"
              defaultValue={employee.pagibig}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.pagibig} />
          </div>

          <div>
            <label
              htmlFor="philhealth"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              PhilHealth
            </label>
            <input
              id="philhealth"
              name="philhealth"
              className="starland-input mt-2"
              defaultValue={employee.philhealth}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.philhealth} />
          </div>

          <div>
            <label
              htmlFor="tin"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              TIN
            </label>
            <input
              id="tin"
              name="tin"
              className="starland-input mt-2"
              defaultValue={employee.tin}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.tin} />
          </div>

          <div>
            <label
              htmlFor="img"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Profile Image Path
            </label>
            <input
              id="img"
              name="img"
              className="starland-input mt-2"
              defaultValue={employee.img}
              disabled={isPending}
            />
            <FieldError messages={state.fieldErrors?.img} />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--starland-border)] pt-5 sm:flex-row sm:justify-end">
        <Link
          href={`/dashboard/employees/${employee.empId}`}
          className="starland-btn starland-btn-secondary"
          aria-disabled={isPending}
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="starland-btn starland-btn-primary"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Update Employee
            </>
          )}
        </button>
      </div>
    </form>
  );
}