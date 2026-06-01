"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { updateEmployeeAction } from "../server/employee-actions";
import { initialUpdateEmployeeActionState } from "../types/employee-action-state-types";
import type { EmployeeFormOptions } from "../types/employee-form-options-types";
import { EmployeeSetupSelects } from "./employee-setup-selects";

type FieldErrors = Record<string, string[] | undefined>;

type EmployeeEditFormEmployee = {
  empId: number | string;
  empNumber?: string | null;
  prc?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  gender?: string | null;
  dob?: string | null;
  pob?: string | null;
  email?: string | null;
  phone?: string | null;
  landline?: string | null;
  civilStatus?: string | null;
  citizenship?: string | null;
  address?: string | null;
  branchId?: number | string | null;
  departmentId?: number | string | null;
  designationId?: number | string | null;
  empTypeId?: number | string | null;
  scheduleId?: number | string | null;
  isFlexible?: boolean | string | null;
  avLeave?: string | number | null;
  sss?: string | null;
  pagibig?: string | null;
  philhealth?: string | null;
  tin?: string | null;
  img?: string | null;
  status?: string | null;

  fatherLastName?: string | null;
  fatherFirstName?: string | null;
  fatherMiddleName?: string | null;
  fatherAddress?: string | null;
  fatherOccupation?: string | null;

  motherLastName?: string | null;
  motherFirstName?: string | null;
  motherMiddleName?: string | null;
  motherAddress?: string | null;
  motherOccupation?: string | null;

  spouseLastName?: string | null;
  spouseFirstName?: string | null;
  spouseMiddleName?: string | null;
  spouseAddress?: string | null;
  spouseOccupation?: string | null;

  employer?: string | null;
  employerAddress?: string | null;
  employerPhone?: string | null;

  child1FullName?: string | null;
  child1DateOfBirth?: string | null;
  child2FullName?: string | null;
  child2DateOfBirth?: string | null;
  child3FullName?: string | null;
  child3DateOfBirth?: string | null;

  elementarySchoolName?: string | null;
  elementaryYearGraduated?: string | null;
  elementaryAddress?: string | null;

  secondarySchoolName?: string | null;
  secondaryYearGraduated?: string | null;
  secondaryAddress?: string | null;

  vocationalSchoolName?: string | null;
  vocationalYearGraduated?: string | null;
  vocationalCourse?: string | null;
  vocationalAddress?: string | null;

  collegeSchoolName?: string | null;
  collegeYearGraduated?: string | null;
  collegeCourse?: string | null;
  collegeAcademicHonors?: string | null;
  collegeAddress?: string | null;

  mastersSchoolName?: string | null;
  mastersYear?: string | null;
  mastersUnits?: string | null;
  mastersAcademicHonors?: string | null;
  mastersAddress?: string | null;

  doctorateSchoolName?: string | null;
  doctorateYear?: string | null;
  doctorateUnits?: string | null;
  doctorateAcademicHonors?: string | null;
  doctorateAddress?: string | null;

  letPasser?: boolean | string | null;

  work1Company?: string | null;
  work1Position?: string | null;
  work1InclusiveDates?: string | null;
  work2Company?: string | null;
  work2Position?: string | null;
  work2InclusiveDates?: string | null;
  work3Company?: string | null;
  work3Position?: string | null;
  work3InclusiveDates?: string | null;

  dateHired?: string | null;
  dateOfJoining?: string | null;
  signature?: string | null;
  dateSigned?: string | null;
};

type EmployeeEditFormProps = {
  employee: EmployeeEditFormEmployee;
  options: EmployeeFormOptions;
};

type TextFieldProps = {
  name: keyof EmployeeEditFormEmployee & string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  disabled?: boolean;
  fieldErrors?: FieldErrors;
};

type TextAreaFieldProps = {
  name: keyof EmployeeEditFormEmployee & string;
  label: string;
  placeholder?: string;
  defaultValue?: string | null;
  disabled?: boolean;
  fieldErrors?: FieldErrors;
};

type SelectFieldProps = {
  name: keyof EmployeeEditFormEmployee & string;
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
  children: ReactNode;
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
        {required ? (
          <span className="text-[var(--starland-danger)]"> *</span>
        ) : null}
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
  name: keyof EmployeeEditFormEmployee & string;
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

function toOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "on";
}

function textValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
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
    <section className="starland-card overflow-hidden">
      <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
        <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
          Employee Editor
        </span>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
          Update Employee
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Update the employee profile, work assignment, family background,
          educational background, work experience, and contract details.
        </p>
      </div>

      <form action={formAction} className="space-y-6 p-5 sm:p-6">
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
          description="Update the required employee identity and contact details."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TextField
              name="empNumber"
              label="Employee Number"
              placeholder="EMP-0001"
              required
              defaultValue={employee.empNumber}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="prc"
              label="PRC"
              placeholder="Optional"
              defaultValue={employee.prc}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="lastName"
              label="Last Name"
              required
              defaultValue={employee.lastName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="firstName"
              label="First Name"
              required
              defaultValue={employee.firstName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="middleName"
              label="Middle Name"
              defaultValue={employee.middleName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <SelectField
              name="gender"
              label="Gender"
              defaultValue={employee.gender}
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
              defaultValue={employee.dob}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="pob"
              label="Place of Birth"
              defaultValue={employee.pob}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              defaultValue={employee.email}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="phone"
              label="Phone"
              type="tel"
              defaultValue={employee.phone}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="landline"
              label="Landline"
              type="tel"
              defaultValue={employee.landline}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <SelectField
              name="civilStatus"
              label="Civil Status"
              defaultValue={employee.civilStatus}
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
              defaultValue={employee.citizenship}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="img"
              label="Employee Photo Path"
              placeholder="uploads/employees/photo.jpg"
              defaultValue={employee.img}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="avLeave"
              label="Available Leave"
              type="number"
              defaultValue={employee.avLeave ?? 0}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <SelectField
              name="status"
              label="Status"
              defaultValue={employee.status ?? "ACTIVE"}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
              options={[
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "INACTIVE", label: "INACTIVE" },
                { value: "ON_LEAVE", label: "ON_LEAVE" },
                { value: "RESIGNED", label: "RESIGNED" },
                { value: "TERMINATED", label: "TERMINATED" },
              ]}
            />
          </div>

          <div className="mt-4">
            <TextAreaField
              name="address"
              label="Address"
              defaultValue={employee.address}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>
        </FormSection>

        <EmployeeSetupSelects
          options={options}
          defaultValues={{
            branchId: toOptionalNumber(employee.branchId),
            departmentId: toOptionalNumber(employee.departmentId),
            designationId: toOptionalNumber(employee.designationId),
            empTypeId: toOptionalNumber(employee.empTypeId),
            scheduleId: toOptionalNumber(employee.scheduleId),
            isFlexible: toBoolean(employee.isFlexible),
          }}
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
              defaultValue={employee.sss}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="pagibig"
              label="Pag-IBIG"
              defaultValue={employee.pagibig}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="philhealth"
              label="PhilHealth"
              defaultValue={employee.philhealth}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="tin"
              label="TIN"
              defaultValue={employee.tin}
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
              defaultValue={employee.fatherLastName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="fatherFirstName"
              label="Father First Name"
              defaultValue={employee.fatherFirstName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="fatherMiddleName"
              label="Father Middle Name"
              defaultValue={employee.fatherMiddleName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="fatherOccupation"
              label="Father Occupation"
              defaultValue={employee.fatherOccupation}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="motherLastName"
              label="Mother Last Name"
              defaultValue={employee.motherLastName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="motherFirstName"
              label="Mother First Name"
              defaultValue={employee.motherFirstName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="motherMiddleName"
              label="Mother Middle Name"
              defaultValue={employee.motherMiddleName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="motherOccupation"
              label="Mother Occupation"
              defaultValue={employee.motherOccupation}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="spouseLastName"
              label="Spouse Last Name"
              defaultValue={employee.spouseLastName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="spouseFirstName"
              label="Spouse First Name"
              defaultValue={employee.spouseFirstName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="spouseMiddleName"
              label="Spouse Middle Name"
              defaultValue={employee.spouseMiddleName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="spouseOccupation"
              label="Spouse Occupation"
              defaultValue={employee.spouseOccupation}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="employer"
              label="Spouse Employer"
              defaultValue={employee.employer}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="employerPhone"
              label="Employer Phone"
              type="tel"
              defaultValue={employee.employerPhone}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextAreaField
              name="fatherAddress"
              label="Father Address"
              defaultValue={employee.fatherAddress}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextAreaField
              name="motherAddress"
              label="Mother Address"
              defaultValue={employee.motherAddress}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextAreaField
              name="spouseAddress"
              label="Spouse Address"
              defaultValue={employee.spouseAddress}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextAreaField
              name="employerAddress"
              label="Employer Address"
              defaultValue={employee.employerAddress}
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
              defaultValue={employee.child1FullName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="child1DateOfBirth"
              label="Child 1 Date of Birth"
              type="date"
              defaultValue={employee.child1DateOfBirth}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <div className="hidden xl:block" />

            <TextField
              name="child2FullName"
              label="Child 2 Full Name"
              defaultValue={employee.child2FullName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="child2DateOfBirth"
              label="Child 2 Date of Birth"
              type="date"
              defaultValue={employee.child2DateOfBirth}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <div className="hidden xl:block" />

            <TextField
              name="child3FullName"
              label="Child 3 Full Name"
              defaultValue={employee.child3FullName}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="child3DateOfBirth"
              label="Child 3 Date of Birth"
              type="date"
              defaultValue={employee.child3DateOfBirth}
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
                defaultValue={employee.elementarySchoolName}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="elementaryYearGraduated"
                label="Elementary Year Graduated"
                defaultValue={employee.elementaryYearGraduated}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="elementaryAddress"
                label="Elementary Address"
                defaultValue={employee.elementaryAddress}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                name="secondarySchoolName"
                label="Secondary School Name"
                defaultValue={employee.secondarySchoolName}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="secondaryYearGraduated"
                label="Secondary Year Graduated"
                defaultValue={employee.secondaryYearGraduated}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="secondaryAddress"
                label="Secondary Address"
                defaultValue={employee.secondaryAddress}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <TextField
                name="vocationalSchoolName"
                label="Vocational School Name"
                defaultValue={employee.vocationalSchoolName}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="vocationalYearGraduated"
                label="Vocational Year Graduated"
                defaultValue={employee.vocationalYearGraduated}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="vocationalCourse"
                label="Vocational Course"
                defaultValue={employee.vocationalCourse}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="vocationalAddress"
                label="Vocational Address"
                defaultValue={employee.vocationalAddress}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              <TextField
                name="collegeSchoolName"
                label="College School Name"
                defaultValue={employee.collegeSchoolName}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="collegeYearGraduated"
                label="College Year Graduated"
                defaultValue={employee.collegeYearGraduated}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="collegeCourse"
                label="College Course"
                defaultValue={employee.collegeCourse}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="collegeAcademicHonors"
                label="College Academic Honors"
                defaultValue={employee.collegeAcademicHonors}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="collegeAddress"
                label="College Address"
                defaultValue={employee.collegeAddress}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              <TextField
                name="mastersSchoolName"
                label="Masters School Name"
                defaultValue={employee.mastersSchoolName}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="mastersYear"
                label="Masters Year"
                defaultValue={employee.mastersYear}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="mastersUnits"
                label="Masters Units"
                defaultValue={employee.mastersUnits}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="mastersAcademicHonors"
                label="Masters Academic Honors"
                defaultValue={employee.mastersAcademicHonors}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="mastersAddress"
                label="Masters Address"
                defaultValue={employee.mastersAddress}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              <TextField
                name="doctorateSchoolName"
                label="Doctorate School Name"
                defaultValue={employee.doctorateSchoolName}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="doctorateYear"
                label="Doctorate Year"
                defaultValue={employee.doctorateYear}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="doctorateUnits"
                label="Doctorate Units"
                defaultValue={employee.doctorateUnits}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="doctorateAcademicHonors"
                label="Doctorate Academic Honors"
                defaultValue={employee.doctorateAcademicHonors}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="doctorateAddress"
                label="Doctorate Address"
                defaultValue={employee.doctorateAddress}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>

            <CheckboxField
              name="letPasser"
              label="LET Passer"
              defaultChecked={toBoolean(employee.letPasser)}
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
                defaultValue={employee.work1Company}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="work1Position"
                label="Position 1"
                defaultValue={employee.work1Position}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="work1InclusiveDates"
                label="Inclusive Dates 1"
                placeholder="Jan 2020 - Dec 2022"
                defaultValue={employee.work1InclusiveDates}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                name="work2Company"
                label="Company 2"
                defaultValue={employee.work2Company}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="work2Position"
                label="Position 2"
                defaultValue={employee.work2Position}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="work2InclusiveDates"
                label="Inclusive Dates 2"
                placeholder="Jan 2020 - Dec 2022"
                defaultValue={employee.work2InclusiveDates}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                name="work3Company"
                label="Company 3"
                defaultValue={employee.work3Company}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="work3Position"
                label="Position 3"
                defaultValue={employee.work3Position}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="work3InclusiveDates"
                label="Inclusive Dates 3"
                placeholder="Jan 2020 - Dec 2022"
                defaultValue={employee.work3InclusiveDates}
                disabled={isPending}
                fieldErrors={state.fieldErrors}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Contract Signing"
          description="These fields are required for contract record updates."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TextField
              name="dateHired"
              label="Date Hired"
              type="date"
              required
              defaultValue={employee.dateHired}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="dateOfJoining"
              label="Date of Joining / First Day"
              type="date"
              required
              defaultValue={employee.dateOfJoining}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="signature"
              label="Signature"
              placeholder="Employee signature/name or file path"
              required
              defaultValue={employee.signature}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />

            <TextField
              name="dateSigned"
              label="Date Signed"
              type="date"
              required
              defaultValue={employee.dateSigned}
              disabled={isPending}
              fieldErrors={state.fieldErrors}
            />
          </div>
        </FormSection>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--starland-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/dashboard/employees/${employee.empId}`}
            className="starland-btn starland-btn-soft"
            aria-disabled={isPending}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Profile
          </Link>

          <ConfirmSubmitButton
            type="submit"
            confirmMessage="Save employee changes?"
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
          </ConfirmSubmitButton>
        </div>
      </form>
    </section>
  );
}