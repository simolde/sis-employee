import type {
  EmployeeFormOptions,
  EmployeeStatusValue,
} from "../types/employee-types";
import { employeeStatusValues } from "../types/employee-types";

type FieldErrors = Record<string, string[] | undefined> | undefined;

type FormValues = Partial<
  Record<string, string | number | boolean | EmployeeStatusValue>
>;

type EmployeeFormFieldsProps = {
  options: EmployeeFormOptions;
  fieldErrors?: FieldErrors;
  disabled: boolean;
  values?: FormValues;
};

function getValue(values: FormValues | undefined, name: string): string {
  const value = values?.[name];

  if (value === undefined || typeof value === "boolean") {
    return "";
  }

  return String(value);
}

function getChecked(values: FormValues | undefined, name: string): boolean {
  return Boolean(values?.[name]);
}

function FieldError({
  messages,
}: {
  messages?: string[];
}) {
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

function TextField({
  name,
  label,
  fieldErrors,
  values,
  disabled,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  fieldErrors?: FieldErrors;
  values?: FormValues;
  disabled: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-bold text-[var(--starland-dark-text)]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="starland-input mt-2"
        defaultValue={getValue(values, name)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <FieldError messages={fieldErrors?.[name]} />
    </div>
  );
}

function TextAreaField({
  name,
  label,
  fieldErrors,
  values,
  disabled,
}: {
  name: string;
  label: string;
  fieldErrors?: FieldErrors;
  values?: FormValues;
  disabled: boolean;
}) {
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
        className="starland-input mt-2 min-h-24 resize-y"
        defaultValue={getValue(values, name)}
        disabled={disabled}
      />
      <FieldError messages={fieldErrors?.[name]} />
    </div>
  );
}

function SelectField({
  name,
  label,
  fieldErrors,
  values,
  disabled,
  children,
}: {
  name: string;
  label: string;
  fieldErrors?: FieldErrors;
  values?: FormValues;
  disabled: boolean;
  children: React.ReactNode;
}) {
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
        defaultValue={getValue(values, name)}
        disabled={disabled}
      >
        {children}
      </select>
      <FieldError messages={fieldErrors?.[name]} />
    </div>
  );
}

function ChildRow({
  index,
  fieldErrors,
  values,
  disabled,
}: {
  index: 1 | 2 | 3;
  fieldErrors?: FieldErrors;
  values?: FormValues;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      <TextField
        name={`child${index}FullName`}
        label={`Child ${index} Full Name`}
        fieldErrors={fieldErrors}
        values={values}
        disabled={disabled}
      />
      <TextField
        name={`child${index}DateOfBirth`}
        label="Date of Birth"
        type="date"
        fieldErrors={fieldErrors}
        values={values}
        disabled={disabled}
      />
    </div>
  );
}

function WorkExperienceRow({
  index,
  fieldErrors,
  values,
  disabled,
}: {
  index: 1 | 2 | 3;
  fieldErrors?: FieldErrors;
  values?: FormValues;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TextField
        name={`work${index}Company`}
        label={`Company ${index}`}
        fieldErrors={fieldErrors}
        values={values}
        disabled={disabled}
      />
      <TextField
        name={`work${index}Position`}
        label="Position"
        fieldErrors={fieldErrors}
        values={values}
        disabled={disabled}
      />
      <TextField
        name={`work${index}InclusiveDates`}
        label="Inclusive Dates"
        placeholder="Example: 2020-2024"
        fieldErrors={fieldErrors}
        values={values}
        disabled={disabled}
      />
    </div>
  );
}

export function EmployeeFormFields({
  options,
  fieldErrors,
  disabled,
  values,
}: EmployeeFormFieldsProps) {
  return (
    <>
      <section className="space-y-4">
        <SectionTitle
          title="Basic Information"
          description="Main employee profile and personal information."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            name="empNumber"
            label="Employee Number"
            placeholder="EMP-0001"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="firstName"
            label="First Name"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="middleName"
            label="Middle Name"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="lastName"
            label="Last Name"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />

          <SelectField
            name="gender"
            label="Gender"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </SelectField>

          <TextField
            name="dob"
            label="Date of Birth"
            type="date"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="pob"
            label="Place of Birth"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="civilStatus"
            label="Civil Status"
            placeholder="Single / Married"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="citizenship"
            label="Citizenship"
            placeholder="Filipino"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
        </div>

        <TextAreaField
          name="address"
          label="Address"
          fieldErrors={fieldErrors}
          values={values}
          disabled={disabled}
        />
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Contact Information"
          description="Employee email and phone details."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            name="email"
            label="Email"
            type="email"
            placeholder="employee@starland.edu.ph"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="phone"
            label="Phone"
            placeholder="+639..."
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="landline"
            label="Landline"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Work Information"
          description="Branch, department, designation, employee type, and schedule."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            name="branchId"
            label="Branch"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          >
            <option value="">Select branch</option>
            {options.branches.map((branch) => (
              <option key={branch.value} value={branch.value}>
                {branch.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            name="departmentId"
            label="Department"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          >
            <option value="">Select department</option>
            {options.departments.map((department) => (
              <option key={department.value} value={department.value}>
                {department.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            name="designationId"
            label="Designation"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          >
            <option value="">Select designation</option>
            {options.designations.map((designation) => (
              <option key={designation.value} value={designation.value}>
                {designation.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            name="empTypeId"
            label="Employee Type"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          >
            <option value="">Select employee type</option>
            {options.empTypes.map((empType) => (
              <option key={empType.value} value={empType.value}>
                {empType.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            name="scheduleId"
            label="Schedule"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          >
            <option value="">Select schedule</option>
            {options.schedules.map((schedule) => (
              <option key={schedule.value} value={schedule.value}>
                {schedule.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            name="status"
            label="Status"
            fieldErrors={fieldErrors}
            values={values ?? { status: "ACTIVE" }}
            disabled={disabled}
          >
            {employeeStatusValues.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </SelectField>

          <TextField
            name="avLeave"
            label="Available Leave"
            type="number"
            fieldErrors={fieldErrors}
            values={values ?? { avLeave: "0" }}
            disabled={disabled}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <input
            name="isFlexible"
            type="checkbox"
            className="h-4 w-4 accent-[var(--starland-main-green)]"
            defaultChecked={getChecked(values, "isFlexible")}
            disabled={disabled}
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
          title="Family Background"
          description="Father, mother, spouse, employer, and child information."
        />

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            Father
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="fatherLastName" label="Last Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="fatherFirstName" label="First Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="fatherMiddleName" label="Middle Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="fatherOccupation" label="Occupation" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
          <div className="mt-4">
            <TextAreaField name="fatherAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            Mother
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="motherLastName" label="Last Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="motherFirstName" label="First Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="motherMiddleName" label="Middle Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="motherOccupation" label="Occupation" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
          <div className="mt-4">
            <TextAreaField name="motherAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            Spouse
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="spouseLastName" label="Last Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="spouseFirstName" label="First Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="spouseMiddleName" label="Middle Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="spouseOccupation" label="Occupation" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
          <div className="mt-4">
            <TextAreaField name="spouseAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TextField name="employer" label="Employer" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          <TextField name="employerPhone" label="Employer Phone" fieldErrors={fieldErrors} values={values} disabled={disabled} />
        </div>

        <TextAreaField
          name="employerAddress"
          label="Employer Address"
          fieldErrors={fieldErrors}
          values={values}
          disabled={disabled}
        />

        <div className="space-y-4 rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="text-sm font-extrabold text-[var(--starland-dark-text)]">
            Children
          </h3>
          <ChildRow index={1} fieldErrors={fieldErrors} values={values} disabled={disabled} />
          <ChildRow index={2} fieldErrors={fieldErrors} values={values} disabled={disabled} />
          <ChildRow index={3} fieldErrors={fieldErrors} values={values} disabled={disabled} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Educational Background"
          description="Elementary, secondary, vocational, college, masters, doctorate, and LET information."
        />

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            Elementary
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="elementarySchoolName" label="School Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="elementaryYearGraduated" label="Year Graduated" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="elementaryAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            Secondary
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="secondarySchoolName" label="School Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="secondaryYearGraduated" label="Year Graduated" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="secondaryAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            Vocational Course
          </h3>
          <div className="grid gap-4 md:grid-cols-4">
            <TextField name="vocationalSchoolName" label="School Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="vocationalYearGraduated" label="Year Graduated" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="vocationalCourse" label="Course" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="vocationalAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            College
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="collegeSchoolName" label="School Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="collegeYearGraduated" label="Year Graduated" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="collegeCourse" label="Course" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="collegeAcademicHonors" label="Academic Honors" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="collegeAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            Masters
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="mastersSchoolName" label="School Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="mastersYear" label="Year" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="mastersUnits" label="Units" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="mastersAcademicHonors" label="Academic Honors" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="mastersAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--starland-border)] p-4">
          <h3 className="mb-4 text-sm font-extrabold text-[var(--starland-dark-text)]">
            Doctorate
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="doctorateSchoolName" label="School Name" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="doctorateYear" label="Year" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="doctorateUnits" label="Units" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="doctorateAcademicHonors" label="Academic Honors" fieldErrors={fieldErrors} values={values} disabled={disabled} />
            <TextField name="doctorateAddress" label="Address" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <input
            name="letPasser"
            type="checkbox"
            className="h-4 w-4 accent-[var(--starland-main-green)]"
            defaultChecked={getChecked(values, "letPasser")}
            disabled={disabled}
          />
          <span>
            <span className="block text-sm font-bold text-[var(--starland-dark-text)]">
              LET Passer?
            </span>
            <span className="block text-xs text-[var(--starland-muted-text)]">
              Check this if the employee has passed the Licensure Examination
              for Teachers.
            </span>
          </span>
        </label>
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Work Experience"
          description="Previous company, position, and inclusive dates."
        />

        <WorkExperienceRow index={1} fieldErrors={fieldErrors} values={values} disabled={disabled} />
        <WorkExperienceRow index={2} fieldErrors={fieldErrors} values={values} disabled={disabled} />
        <WorkExperienceRow index={3} fieldErrors={fieldErrors} values={values} disabled={disabled} />
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Government and Other Details"
          description="Optional employee identification and profile image path."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <TextField name="prc" label="PRC" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          <TextField name="sss" label="SSS" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          <TextField name="pagibig" label="Pag-IBIG" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          <TextField name="philhealth" label="PhilHealth" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          <TextField name="tin" label="TIN" fieldErrors={fieldErrors} values={values} disabled={disabled} />
          <TextField
            name="img"
            label="Profile Image Path"
            placeholder="uploads/employees/photo.jpg"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          title="Contract Signing"
          description="Required contract information and signature path."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextField
            name="dateHired"
            label="Date Hired"
            type="date"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="dateOfJoining"
            label="Date of Joining / First Day"
            type="date"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="signature"
            label="Signature"
            placeholder="uploads/employees/signatures/EMP-0001.png"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
          <TextField
            name="dateSigned"
            label="Date Signed"
            type="date"
            fieldErrors={fieldErrors}
            values={values}
            disabled={disabled}
          />
        </div>
      </section>
    </>
  );
}