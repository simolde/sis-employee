import { z } from "zod";
import { employeeStatusValues } from "../types/employee-types";

function emptyToNull(value: unknown): unknown {
  if (value === "" || value === undefined) {
    return null;
  }

  return value;
}

const optionalTextSchema = z.preprocess(
  emptyToNull,
  z.string().trim().max(191).nullable(),
);

const optionalShortTextSchema = z.preprocess(
  emptyToNull,
  z.string().trim().max(80).nullable(),
);

const optionalLongTextSchema = z.preprocess(
  emptyToNull,
  z.string().trim().max(1000).nullable(),
);

const optionalEmailSchema = z.preprocess(
  emptyToNull,
  z.string().trim().email("Enter a valid email address.").max(191).nullable(),
);

const optionalDateSchema = z.preprocess(
  emptyToNull,
  z.coerce.date().nullable(),
);

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "This date is required.")
  .pipe(z.coerce.date());

const optionalIdSchema = z.preprocess(
  emptyToNull,
  z.coerce.number().int().positive().nullable(),
);

const requiredIdSchema = z.coerce
  .number({
    error: "This field is required.",
  })
  .int()
  .positive("This field is required.");

const requiredSignatureSchema = z
  .string()
  .trim()
  .min(1, "Signature is required.")
  .max(255, "Signature path is too long.");

export const employeeMutationValidationSchema = z.object({
  empNumber: z
    .string()
    .trim()
    .min(1, "Employee number is required.")
    .max(80, "Employee number is too long.")
    .transform((value) => value.toUpperCase()),

  prc: optionalTextSchema,

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(100, "Last name is too long."),

  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(100, "First name is too long."),

  middleName: z.preprocess(
    emptyToNull,
    z.string().trim().max(100).nullable(),
  ),

  gender: z.preprocess(emptyToNull, z.string().trim().max(30).nullable()),
  dob: optionalDateSchema,
  pob: optionalTextSchema,
  email: optionalEmailSchema,
  phone: z.preprocess(emptyToNull, z.string().trim().max(40).nullable()),
  landline: z.preprocess(emptyToNull, z.string().trim().max(40).nullable()),
  civilStatus: z.preprocess(emptyToNull, z.string().trim().max(60).nullable()),
  citizenship: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  address: optionalLongTextSchema,

  branchId: requiredIdSchema,
  departmentId: optionalIdSchema,
  designationId: optionalIdSchema,
  empTypeId: optionalIdSchema,
  scheduleId: optionalIdSchema,

  isFlexible: z.preprocess(
    (value) => value === "on" || value === "true",
    z.boolean(),
  ),

  avLeave: z.coerce.number().min(0).max(999).default(0),

  sss: optionalTextSchema,
  pagibig: optionalTextSchema,
  philhealth: optionalTextSchema,
  tin: optionalTextSchema,
  img: z.preprocess(emptyToNull, z.string().trim().max(255).nullable()),

  fatherLastName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  fatherFirstName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  fatherMiddleName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  fatherAddress: optionalLongTextSchema,
  fatherOccupation: optionalTextSchema,

  motherLastName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  motherFirstName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  motherMiddleName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  motherAddress: optionalLongTextSchema,
  motherOccupation: optionalTextSchema,

  spouseLastName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  spouseFirstName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  spouseMiddleName: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()),
  spouseAddress: optionalLongTextSchema,
  spouseOccupation: optionalTextSchema,

  employer: optionalTextSchema,
  employerAddress: optionalLongTextSchema,
  employerPhone: z.preprocess(emptyToNull, z.string().trim().max(40).nullable()),

  child1FullName: optionalTextSchema,
  child1DateOfBirth: optionalDateSchema,
  child2FullName: optionalTextSchema,
  child2DateOfBirth: optionalDateSchema,
  child3FullName: optionalTextSchema,
  child3DateOfBirth: optionalDateSchema,

  elementarySchoolName: optionalTextSchema,
  elementaryYearGraduated: optionalShortTextSchema,
  elementaryAddress: optionalLongTextSchema,

  secondarySchoolName: optionalTextSchema,
  secondaryYearGraduated: optionalShortTextSchema,
  secondaryAddress: optionalLongTextSchema,

  vocationalSchoolName: optionalTextSchema,
  vocationalYearGraduated: optionalShortTextSchema,
  vocationalCourse: optionalTextSchema,
  vocationalAddress: optionalLongTextSchema,

  collegeSchoolName: optionalTextSchema,
  collegeYearGraduated: optionalShortTextSchema,
  collegeCourse: optionalTextSchema,
  collegeAcademicHonors: optionalTextSchema,
  collegeAddress: optionalLongTextSchema,

  mastersSchoolName: optionalTextSchema,
  mastersYear: optionalShortTextSchema,
  mastersUnits: optionalShortTextSchema,
  mastersAcademicHonors: optionalTextSchema,
  mastersAddress: optionalLongTextSchema,

  doctorateSchoolName: optionalTextSchema,
  doctorateYear: optionalShortTextSchema,
  doctorateUnits: optionalShortTextSchema,
  doctorateAcademicHonors: optionalTextSchema,
  doctorateAddress: optionalLongTextSchema,

  letPasser: z.preprocess(
    (value) => value === "on" || value === "true",
    z.boolean(),
  ),

  work1Company: optionalTextSchema,
  work1Position: optionalTextSchema,
  work1InclusiveDates: optionalTextSchema,
  work2Company: optionalTextSchema,
  work2Position: optionalTextSchema,
  work2InclusiveDates: optionalTextSchema,
  work3Company: optionalTextSchema,
  work3Position: optionalTextSchema,
  work3InclusiveDates: optionalTextSchema,

  dateHired: requiredDateSchema,
  dateOfJoining: requiredDateSchema,
  signature: requiredSignatureSchema,
  dateSigned: requiredDateSchema,

  status: z.enum(employeeStatusValues).default("ACTIVE"),
});

export const createEmployeeValidationSchema = employeeMutationValidationSchema;
export const updateEmployeeValidationSchema = employeeMutationValidationSchema;

export type CreateEmployeeInput = z.infer<
  typeof createEmployeeValidationSchema
>;

export type UpdateEmployeeInput = z.infer<
  typeof updateEmployeeValidationSchema
>;