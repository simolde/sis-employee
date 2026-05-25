"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createEmployeeValidationSchema,
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

  const duplicateEmpNumber = await prisma.employee.findUnique({
    where: {
      empNumber: data.empNumber,
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

  if (data.email) {
    const duplicateEmail = await prisma.employee.findUnique({
      where: {
        email: data.email,
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

  let createdEmpId: number;

  try {
    const employee = await prisma.employee.create({
      data: {
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
      },
      select: employeeAuditSelect,
    });

    createdEmpId = employee.empId;

    await prisma.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "EMPLOYEE_CREATED",
        entityType: "employee",
        entityId: String(employee.empId),
        newValue: buildEmployeeAuditValue(employee),
      },
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

  const duplicateEmpNumber = await prisma.employee.findFirst({
    where: {
      empNumber: data.empNumber,
      NOT: {
        empId: employeeId,
      },
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

  if (data.email) {
    const duplicateEmail = await prisma.employee.findFirst({
      where: {
        email: data.email,
        NOT: {
          empId: employeeId,
        },
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

  try {
    const updatedEmployee = await prisma.employee.update({
      where: {
        empId: employeeId,
      },
      data: {
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
      },
      select: employeeAuditSelect,
    });

    await prisma.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "EMPLOYEE_UPDATED",
        entityType: "employee",
        entityId: String(updatedEmployee.empId),
        oldValue: buildEmployeeAuditValue(existingEmployee),
        newValue: buildEmployeeAuditValue(updatedEmployee),
      },
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