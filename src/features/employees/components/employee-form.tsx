"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { createEmployeeAction } from "../server/employee-actions";
import { initialCreateEmployeeActionState } from "../types/employee-action-state-types";
import type { EmployeeFormOptions } from "../types/employee-form-options-types";
import { EmployeeSetupSelects } from "./employee-setup-selects";

type EmployeeFormProps = {
  options: EmployeeFormOptions;
};

type FieldErrors = Record<string, string[] | undefined>;

type TextFieldProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  disabled?: boolean;
  fieldErrors?: FieldErrors;
};

type TextAreaFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string | null;
  disabled?: boolean;
  fieldErrors?: FieldErrors;
};

type SelectFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  disabled?: boolean;
  fieldErrors?: FieldErrors;
  options: {
    value: string;
    label: string;
  }[];
};

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
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

function FormSection({ title, description, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div>
        <h2 className="text-base font-extrabold text-[var(--starland-dark-text)]">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextField({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  defaultValue,
  disabled,
  fieldErrors,
}: TextFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-bold text-[var(--starland-dark-text)]"
      >
        {label}
        {required ? <span className="text-[var(--starland-danger)]"> *</span> : null}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        className="starland-input mt-2"
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
      />

      <FieldError messages={fieldErrors?.[name]} />
    </div>
  );
}

function TextAreaField({
  name,
  label,
  placeholder,
  defaultValue,
  disabled,
  fieldErrors,
}: TextAreaFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-bold text-[var(--starland-dark-text)]"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        className="starland-input mt-2 min-h-24"
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
      />

      <FieldError messages={fieldErrors?.[name]} />
    </div>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  disabled,
  fieldErrors,
  options,
}: SelectFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-bold text-[var(--starland-dark-text)]"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        className="starland-input mt-2"
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <FieldError messages={fieldErrors?.[name]} />
    </div>
  );
}

function CheckboxField({
  name,
  label,
  disabled,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  disabled?: boolean;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--starland-dark-text)]">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
      />
      {label}
    </label>
  );
}

export function EmployeeForm({ options }: EmployeeFormProps) {
  const [state, formAction, isPending] = useActionState(
    createEmployeeAction,
    initialCreateEmployeeActionState,
  );

  return (
    <form action={formAction} className="starland-card space-y-6 p-5 sm:p-6">
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

      <FormSection
        title="Basic Employee Information"
        description="Enter the required employee identity and contact details."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextField
            name="empNumber"
            label="Employee Number"
            placeholder="EMP-0001"
            required
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="prc"
            label="PRC"
            placeholder="Optional"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="lastName"
            label="Last Name"
            required
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="firstName"
            label="First Name"
            required
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="middleName"
            label="Middle Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <SelectField
            name="gender"
            label="Gender"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
            options={[
              { value: "", label: "Select gender" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ]}
          />

          <TextField
            name="dob"
            label="Date of Birth"
            type="date"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="pob"
            label="Place of Birth"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="email"
            label="Email"
            type="email"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="phone"
            label="Phone"
            type="tel"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="landline"
            label="Landline"
            type="tel"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <SelectField
            name="civilStatus"
            label="Civil Status"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
            options={[
              { value: "", label: "Select civil status" },
              { value: "SINGLE", label: "Single" },
              { value: "MARRIED", label: "Married" },
              { value: "WIDOWED", label: "Widowed" },
              { value: "SEPARATED", label: "Separated" },
            ]}
          />

          <TextField
            name="citizenship"
            label="Citizenship"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="img"
            label="Employee Photo Path"
            placeholder="uploads/employees/photo.jpg"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="avLeave"
            label="Available Leave"
            type="number"
            defaultValue={0}
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <SelectField
            name="status"
            label="Status"
            defaultValue="ACTIVE"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
            options={[
              { value: "ACTIVE", label: "ACTIVE" },
              { value: "INACTIVE", label: "INACTIVE" },
              { value: "RESIGNED", label: "RESIGNED" },
              { value: "TERMINATED", label: "TERMINATED" },
            ]}
          />
        </div>

        <div className="mt-4">
          <TextAreaField
            name="address"
            label="Address"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />
        </div>
      </FormSection>

      <EmployeeSetupSelects
        options={options}
        disabled={isPending}
        fieldErrors={state.fieldErrors}
      />

      <FormSection
        title="Government Numbers"
        description="Optional statutory numbers for employee records."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextField
            name="sss"
            label="SSS"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="pagibig"
            label="Pag-IBIG"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="philhealth"
            label="PhilHealth"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="tin"
            label="TIN"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />
        </div>
      </FormSection>

      <FormSection title="Family Background">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextField
            name="fatherLastName"
            label="Father Last Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="fatherFirstName"
            label="Father First Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="fatherMiddleName"
            label="Father Middle Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="fatherOccupation"
            label="Father Occupation"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="motherLastName"
            label="Mother Last Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="motherFirstName"
            label="Mother First Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="motherMiddleName"
            label="Mother Middle Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="motherOccupation"
            label="Mother Occupation"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="spouseLastName"
            label="Spouse Last Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="spouseFirstName"
            label="Spouse First Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="spouseMiddleName"
            label="Spouse Middle Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="spouseOccupation"
            label="Spouse Occupation"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="employer"
            label="Spouse Employer"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="employerPhone"
            label="Employer Phone"
            type="tel"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextAreaField
            name="fatherAddress"
            label="Father Address"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextAreaField
            name="motherAddress"
            label="Mother Address"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextAreaField
            name="spouseAddress"
            label="Spouse Address"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextAreaField
            name="employerAddress"
            label="Employer Address"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />
        </div>
      </FormSection>

      <FormSection title="Children">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextField
            name="child1FullName"
            label="Child 1 Full Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="child1DateOfBirth"
            label="Child 1 Date of Birth"
            type="date"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <div className="hidden xl:block" />

          <TextField
            name="child2FullName"
            label="Child 2 Full Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="child2DateOfBirth"
            label="Child 2 Date of Birth"
            type="date"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <div className="hidden xl:block" />

          <TextField
            name="child3FullName"
            label="Child 3 Full Name"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="child3DateOfBirth"
            label="Child 3 Date of Birth"
            type="date"
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />
        </div>
      </FormSection>

      <FormSection title="Educational Background">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              name="elementarySchoolName"
              label="Elementary School Name"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="elementaryYearGraduated"
              label="Elementary Year Graduated"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="elementaryAddress"
              label="Elementary Address"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              name="secondarySchoolName"
              label="Secondary School Name"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="secondaryYearGraduated"
              label="Secondary Year Graduated"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="secondaryAddress"
              label="Secondary Address"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <TextField
              name="vocationalSchoolName"
              label="Vocational School Name"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="vocationalYearGraduated"
              label="Vocational Year Graduated"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="vocationalCourse"
              label="Vocational Course"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="vocationalAddress"
              label="Vocational Address"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <TextField
              name="collegeSchoolName"
              label="College School Name"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="collegeYearGraduated"
              label="College Year Graduated"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="collegeCourse"
              label="College Course"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="collegeAcademicHonors"
              label="College Academic Honors"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="collegeAddress"
              label="College Address"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <TextField
              name="mastersSchoolName"
              label="Masters School Name"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="mastersYear"
              label="Masters Year"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="mastersUnits"
              label="Masters Units"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="mastersAcademicHonors"
              label="Masters Academic Honors"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="mastersAddress"
              label="Masters Address"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <TextField
              name="doctorateSchoolName"
              label="Doctorate School Name"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="doctorateYear"
              label="Doctorate Year"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="doctorateUnits"
              label="Doctorate Units"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="doctorateAcademicHonors"
              label="Doctorate Academic Honors"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="doctorateAddress"
              label="Doctorate Address"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <CheckboxField
            name="letPasser"
            label="LET Passer"
            disabled={isPending}
          />
        </div>
      </FormSection>

      <FormSection title="Work Experience">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              name="work1Company"
              label="Company 1"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="work1Position"
              label="Position 1"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="work1InclusiveDates"
              label="Inclusive Dates 1"
              placeholder="Jan 2020 - Dec 2022"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              name="work2Company"
              label="Company 2"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="work2Position"
              label="Position 2"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="work2InclusiveDates"
              label="Inclusive Dates 2"
              placeholder="Jan 2020 - Dec 2022"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              name="work3Company"
              label="Company 3"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="work3Position"
              label="Position 3"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="work3InclusiveDates"
              label="Inclusive Dates 3"
              placeholder="Jan 2020 - Dec 2022"
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Contract Signing"
        description="These fields are required for contract record creation."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextField
            name="dateHired"
            label="Date Hired"
            type="date"
            required
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="dateOfJoining"
            label="Date of Joining / First Day"
            type="date"
            required
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="signature"
            label="Signature"
            placeholder="Employee signature/name or file path"
            required
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />

          <TextField
            name="dateSigned"
            label="Date Signed"
            type="date"
            required
            disabled={isPending}
            fieldErrors={state.fieldErrors}
          />
        </div>
      </FormSection>

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--starland-border)] pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/employees"
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
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save Employee
            </>
          )}
        </button>
      </div>
    </form>
  );
}