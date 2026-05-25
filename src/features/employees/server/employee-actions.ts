"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createEmployeeValidationSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  updateEmployeeValidationSchema,
} from "../validators/employee-validation";

export type CreateEmployeeActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type UpdateEmployeeActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialCreateEmployeeActionState: CreateEmployeeActionState = {
  ok: false,
  message: "",
};

export const initialUpdateEmployeeActionState: UpdateEmployeeActionState = {
  ok: false,
  message: "",
};

type EmployeeAuditSource = {
  empId: number;
  empNumber: string;
  prc: string | null;
  lastName: string;
  firstName: string;
  middleName: string | null;
  gender: string | null;
  dob: Date | null;
  pob: string | null;
  email: string | null;
  phone: string | null;
  landline: string | null;
  civilStatus: string | null;
  citizenship: string | null;
  address: string | null;
  branchId: number;
  departmentId: number | null;
  designationId: number | null;
  empTypeId: number | null;
  scheduleId: number | null;
  isFlexible: boolean;
  avLeave: number;
  sss: string | null;
  pagibig: string | null;
  philhealth: string | null;
  tin: string | null;
  img: string | null;
  dateHired: Date | null;
  dateSigned: Date | null;
  status: string;
};

const employeeAuditSelect = {
  empId: true,
  empNumber: true,
  prc: true,
  lastName: true,
  firstName: true,
  middleName: true,
  gender: true,
  dob: true,
  pob: true,
  email: true,
  phone: true,
  landline: true,
  civilStatus: true,
  citizenship: true,
  address: true,
  branchId: true,
  departmentId: true,
  designationId: true,
  empTypeId: true,
  scheduleId: true,
  isFlexible: true,
  avLeave: true,
  sss: true,
  pagibig: true,
  philhealth: true,
  tin: true,
  img: true,
  dateHired: true,
  dateSigned: true,
  status: true,
} satisfies Prisma.EmployeeSelect;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function parseEmployeeId(empId: string): number | null {
  const parsed = Number(empId);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function buildEmployeeAuditValue(
  employee: EmployeeAuditSource,
): Prisma.InputJsonObject {
  return {
    empId: employee.empId,
    empNumber: employee.empNumber,
    prc: employee.prc,
    lastName: employee.lastName,
    firstName: employee.firstName,
    middleName: employee.middleName,
    gender: employee.gender,
    dob: employee.dob?.toISOString() ?? null,
    pob: employee.pob,
    email: employee.email,
    phone: employee.phone,
    landline: employee.landline,
    civilStatus: employee.civilStatus,
    citizenship: employee.citizenship,
    address: employee.address,
    branchId: employee.branchId,
    departmentId: employee.departmentId,
    designationId: employee.designationId,
    empTypeId: employee.empTypeId,
    scheduleId: employee.scheduleId,
    isFlexible: employee.isFlexible,
    avLeave: employee.avLeave,
    sss: employee.sss,
    pagibig: employee.pagibig,
    philhealth: employee.philhealth,
    tin: employee.tin,
    img: employee.img,
    dateHired: employee.dateHired?.toISOString() ?? null,
    dateSigned: employee.dateSigned?.toISOString() ?? null,
    status: employee.status,
  };
}

function buildFamilyBackgroundData(
  data: CreateEmployeeInput | UpdateEmployeeInput,
) {
  return {
    fatherLastName: data.fatherLastName,
    fatherFirstName: data.fatherFirstName,
    fatherMiddleName: data.fatherMiddleName,
    fatherAddress: data.fatherAddress,
    fatherOccupation: data.fatherOccupation,
    motherLastName: data.motherLastName,
    motherFirstName: data.motherFirstName,
    motherMiddleName: data.motherMiddleName,
    motherAddress: data.motherAddress,
    motherOccupation: data.motherOccupation,
    spouseLastName: data.spouseLastName,
    spouseFirstName: data.spouseFirstName,
    spouseMiddleName: data.spouseMiddleName,
    spouseAddress: data.spouseAddress,
    spouseOccupation: data.spouseOccupation,
    employer: data.employer,
    employerAddress: data.employerAddress,
    employerPhone: data.employerPhone,
  };
}

function buildChildrenData(data: CreateEmployeeInput | UpdateEmployeeInput) {
  return [
    {
      fullName: data.child1FullName,
      dateOfBirth: data.child1DateOfBirth,
    },
    {
      fullName: data.child2FullName,
      dateOfBirth: data.child2DateOfBirth,
    },
    {
      fullName: data.child3FullName,
      dateOfBirth: data.child3DateOfBirth,
    },
  ]
    .filter((child) => child.fullName)
    .map((child) => ({
      fullName: child.fullName as string,
      dateOfBirth: child.dateOfBirth,
    }));
}

function buildEducationalBackgroundData(
  data: CreateEmployeeInput | UpdateEmployeeInput,
) {
  const educationRows = [
    {
      level: "ELEMENTARY" as const,
      schoolName: data.elementarySchoolName,
      yearGraduated: data.elementaryYearGraduated,
      course: null,
      units: null,
      academicHonors: null,
      address: data.elementaryAddress,
    },
    {
      level: "SECONDARY" as const,
      schoolName: data.secondarySchoolName,
      yearGraduated: data.secondaryYearGraduated,
      course: null,
      units: null,
      academicHonors: null,
      address: data.secondaryAddress,
    },
    {
      level: "VOCATIONAL" as const,
      schoolName: data.vocationalSchoolName,
      yearGraduated: data.vocationalYearGraduated,
      course: data.vocationalCourse,
      units: null,
      academicHonors: null,
      address: data.vocationalAddress,
    },
    {
      level: "COLLEGE" as const,
      schoolName: data.collegeSchoolName,
      yearGraduated: data.collegeYearGraduated,
      course: data.collegeCourse,
      units: null,
      academicHonors: data.collegeAcademicHonors,
      address: data.collegeAddress,
    },
    {
      level: "MASTERS" as const,
      schoolName: data.mastersSchoolName,
      yearGraduated: data.mastersYear,
      course: null,
      units: data.mastersUnits,
      academicHonors: data.mastersAcademicHonors,
      address: data.mastersAddress,
    },
    {
      level: "DOCTORATE" as const,
      schoolName: data.doctorateSchoolName,
      yearGraduated: data.doctorateYear,
      course: null,
      units: data.doctorateUnits,
      academicHonors: data.doctorateAcademicHonors,
      address: data.doctorateAddress,
    },
  ];

  return educationRows.filter((row) =>
    Boolean(
      row.schoolName ||
        row.yearGraduated ||
        row.course ||
        row.units ||
        row.academicHonors ||
        row.address,
    ),
  );
}

function buildWorkExperienceData(
  data: CreateEmployeeInput | UpdateEmployeeInput,
) {
  return [
    {
      company: data.work1Company,
      position: data.work1Position,
      inclusiveDates: data.work1InclusiveDates,
    },
    {
      company: data.work2Company,
      position: data.work2Position,
      inclusiveDates: data.work2InclusiveDates,
    },
    {
      company: data.work3Company,
      position: data.work3Position,
      inclusiveDates: data.work3InclusiveDates,
    },
  ]
    .filter((work) => work.company && work.position)
    .map((work) => ({
      company: work.company as string,
      position: work.position as string,
      inclusiveDates: work.inclusiveDates,
    }));
}

function buildEmployeeCoreData(data: CreateEmployeeInput | UpdateEmployeeInput) {
  return {
    empNumber: data.empNumber,
    prc: data.prc,
    lastName: data.lastName,
    firstName: data.firstName,
    middleName: data.middleName,
    gender: data.gender,
    dob: data.dob,
    pob: data.pob,
    email: data.email,
    phone: data.phone,
    landline: data.landline,
    civilStatus: data.civilStatus,
    citizenship: data.citizenship,
    address: data.address,
    branchId: data.branchId,
    departmentId: data.departmentId,
    designationId: data.designationId,
    empTypeId: data.empTypeId,
    scheduleId: data.scheduleId,
    isFlexible: data.isFlexible,
    avLeave: data.avLeave,
    sss: data.sss,
    pagibig: data.pagibig,
    philhealth: data.philhealth,
    tin: data.tin,
    img: data.img,
    dateHired: data.dateHired,
    dateSigned: data.dateSigned,
    status: data.status,
  };
}

async function validateDuplicateEmployee(input: {
  empId?: number;
  empNumber: string;
  email: string | null;
}): Promise<CreateEmployeeActionState | UpdateEmployeeActionState | null> {
  const duplicateEmpNumber = await prisma.employee.findFirst({
    where: {
      empNumber: input.empNumber,
      ...(input.empId
        ? {
            NOT: {
              empId: input.empId,
            },
          }
        : {}),
    },
    select: {
      empId: true,
    },
  });

  if (duplicateEmpNumber) {
    return {
      ok: false,
      message: "Employee number already exists.",
      fieldErrors: {
        empNumber: ["Employee number already exists."],
      },
    };
  }

  if (input.email) {
    const duplicateEmail = await prisma.employee.findFirst({
      where: {
        email: input.email,
        ...(input.empId
          ? {
              NOT: {
                empId: input.empId,
              },
            }
          : {}),
      },
      select: {
        empId: true,
      },
    });

    if (duplicateEmail) {
      return {
        ok: false,
        message: "Email address already exists.",
        fieldErrors: {
          email: ["Email address already exists."],
        },
      };
    }
  }

  return null;
}

export async function createEmployeeAction(
  _previousState: CreateEmployeeActionState,
  formData: FormData,
): Promise<CreateEmployeeActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to create employee records.",
    };
  }

  const parsed = createEmployeeValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const duplicateError = await validateDuplicateEmployee({
    empNumber: data.empNumber,
    email: data.email,
  });

  if (duplicateError) {
    return duplicateError;
  }

  let createdEmpId: number;

  try {
    const createdEmployee = await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: buildEmployeeCoreData(data),
        select: employeeAuditSelect,
      });

      await tx.employeeFamilyBackground.create({
        data: {
          empId: employee.empId,
          ...buildFamilyBackgroundData(data),
        },
      });

      const children = buildChildrenData(data);

      if (children.length > 0) {
        await tx.employeeChild.createMany({
          data: children.map((child) => ({
            empId: employee.empId,
            ...child,
          })),
        });
      }

      await tx.employeeEducationSummary.create({
        data: {
          empId: employee.empId,
          letPasser: data.letPasser,
        },
      });

      const educationRows = buildEducationalBackgroundData(data);

      if (educationRows.length > 0) {
        await tx.employeeEducationalBackground.createMany({
          data: educationRows.map((education) => ({
            empId: employee.empId,
            ...education,
          })),
        });
      }

      const workRows = buildWorkExperienceData(data);

      if (workRows.length > 0) {
        await tx.employeeWorkExperience.createMany({
          data: workRows.map((work) => ({
            empId: employee.empId,
            ...work,
          })),
        });
      }

      await tx.employeeContract.create({
        data: {
          empId: employee.empId,
          dateHired: data.dateHired,
          dateOfJoining: data.dateOfJoining,
          signature: data.signature,
          dateSigned: data.dateSigned,
        },
      });

      await tx.activityLog.create({
        data: {
          actorUserId: session.userId,
          action: "EMPLOYEE_CREATED",
          entityType: "employee",
          entityId: String(employee.empId),
          newValue: buildEmployeeAuditValue(employee),
        },
      });

      return employee;
    });

    createdEmpId = createdEmployee.empId;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        message:
          "Employee number or email already exists. Please check the employee record.",
      };
    }

    throw error;
  }

  revalidatePath("/dashboard/employees");
  redirect(`/dashboard/employees/${createdEmpId}`);
}

export async function updateEmployeeAction(
  empId: string,
  _previousState: UpdateEmployeeActionState,
  formData: FormData,
): Promise<UpdateEmployeeActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to update employee records.",
    };
  }

  const employeeId = parseEmployeeId(empId);

  if (!employeeId) {
    return {
      ok: false,
      message: "Invalid employee ID.",
    };
  }

  const parsed = updateEmployeeValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existingEmployee = await prisma.employee.findUnique({
    where: {
      empId: employeeId,
    },
    select: employeeAuditSelect,
  });

  if (!existingEmployee) {
    return {
      ok: false,
      message: "Employee record was not found.",
    };
  }

  const duplicateError = await validateDuplicateEmployee({
    empId: employeeId,
    empNumber: data.empNumber,
    email: data.email,
  });

  if (duplicateError) {
    return duplicateError;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updatedEmployee = await tx.employee.update({
        where: {
          empId: employeeId,
        },
        data: buildEmployeeCoreData(data),
        select: employeeAuditSelect,
      });

      await tx.employeeFamilyBackground.upsert({
        where: {
          empId: employeeId,
        },
        create: {
          empId: employeeId,
          ...buildFamilyBackgroundData(data),
        },
        update: buildFamilyBackgroundData(data),
      });

      await tx.employeeChild.deleteMany({
        where: {
          empId: employeeId,
        },
      });

      const children = buildChildrenData(data);

      if (children.length > 0) {
        await tx.employeeChild.createMany({
          data: children.map((child) => ({
            empId: employeeId,
            ...child,
          })),
        });
      }

      await tx.employeeEducationSummary.upsert({
        where: {
          empId: employeeId,
        },
        create: {
          empId: employeeId,
          letPasser: data.letPasser,
        },
        update: {
          letPasser: data.letPasser,
        },
      });

      await tx.employeeEducationalBackground.deleteMany({
        where: {
          empId: employeeId,
        },
      });

      const educationRows = buildEducationalBackgroundData(data);

      if (educationRows.length > 0) {
        await tx.employeeEducationalBackground.createMany({
          data: educationRows.map((education) => ({
            empId: employeeId,
            ...education,
          })),
        });
      }

      await tx.employeeWorkExperience.deleteMany({
        where: {
          empId: employeeId,
        },
      });

      const workRows = buildWorkExperienceData(data);

      if (workRows.length > 0) {
        await tx.employeeWorkExperience.createMany({
          data: workRows.map((work) => ({
            empId: employeeId,
            ...work,
          })),
        });
      }

      await tx.employeeContract.upsert({
        where: {
          empId: employeeId,
        },
        create: {
          empId: employeeId,
          dateHired: data.dateHired,
          dateOfJoining: data.dateOfJoining,
          signature: data.signature,
          dateSigned: data.dateSigned,
        },
        update: {
          dateHired: data.dateHired,
          dateOfJoining: data.dateOfJoining,
          signature: data.signature,
          dateSigned: data.dateSigned,
        },
      });

      await tx.activityLog.create({
        data: {
          actorUserId: session.userId,
          action: "EMPLOYEE_UPDATED",
          entityType: "employee",
          entityId: String(updatedEmployee.empId),
          oldValue: buildEmployeeAuditValue(existingEmployee),
          newValue: buildEmployeeAuditValue(updatedEmployee),
        },
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        message:
          "Employee number or email already exists. Please check the employee record.",
      };
    }

    throw error;
  }

  revalidatePath("/dashboard/employees");
  revalidatePath(`/dashboard/employees/${employeeId}`);
  redirect(`/dashboard/employees/${employeeId}`);
}