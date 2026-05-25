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

  dateHired: optionalDateSchema,
  dateSigned: optionalDateSchema,

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