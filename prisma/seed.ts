import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/db/prisma";
import { env } from "../src/lib/env";
import {
  rolePermissionMap,
  seedPermissions,
  seedRoles,
} from "../src/lib/seed/seed-data";
import {
  requireSeedPassword,
  splitFullName,
} from "../src/lib/seed/seed-utils";

async function seedRolesAndPermissions() {
  for (const role of seedRoles) {
    await prisma.role.upsert({
      where: {
        code: role.code,
      },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        status: "ACTIVE",
      },
      update: {
        name: role.name,
        description: role.description,
        status: "ACTIVE",
      },
    });
  }

  for (const permission of seedPermissions) {
    await prisma.permission.upsert({
      where: {
        code: permission.code,
      },
      create: {
        code: permission.code,
        name: permission.name,
        module: permission.module,
        status: "ACTIVE",
      },
      update: {
        name: permission.name,
        module: permission.module,
        status: "ACTIVE",
      },
    });
  }

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
    const role = await prisma.role.findUniqueOrThrow({
      where: {
        code: roleCode,
      },
      select: {
        roleId: true,
      },
    });

    const permissions = await prisma.permission.findMany({
      where: {
        code: {
          in: permissionCodes,
        },
      },
      select: {
        permissionId: true,
      },
    });

    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.roleId,
            permissionId: permission.permissionId,
          },
        },
        create: {
          roleId: role.roleId,
          permissionId: permission.permissionId,
        },
        update: {},
      });
    }
  }
}

async function seedOrganizationDefaults() {
  const branch = await prisma.branch.upsert({
    where: {
      branchCode: "MAIN",
    },
    create: {
      branchCode: "MAIN",
      name: "Starland Main Branch",
      address: "Starland International School, Inc.",
      status: "ACTIVE",
    },
    update: {
      name: "Starland Main Branch",
      address: "Starland International School, Inc.",
      status: "ACTIVE",
    },
  });

  const department = await prisma.department.upsert({
    where: {
      departmentCode: "ADMIN",
    },
    create: {
      departmentCode: "ADMIN",
      name: "Administration",
      status: "ACTIVE",
    },
    update: {
      name: "Administration",
      status: "ACTIVE",
    },
  });

  const designation = await prisma.designation.upsert({
    where: {
      designationCode: "SYSTEM_ADMIN",
    },
    create: {
      designationCode: "SYSTEM_ADMIN",
      name: "System Administrator",
      status: "ACTIVE",
    },
    update: {
      name: "System Administrator",
      status: "ACTIVE",
    },
  });

  const empType = await prisma.empType.upsert({
    where: {
      empTypeCode: "REGULAR",
    },
    create: {
      empTypeCode: "REGULAR",
      name: "Regular",
      status: "ACTIVE",
    },
    update: {
      name: "Regular",
      status: "ACTIVE",
    },
  });

  const shift = await prisma.shift.upsert({
    where: {
      shiftCode: "REGULAR_DAY",
    },
    create: {
      shiftCode: "REGULAR_DAY",
      name: "Regular Day Shift",
      startTime: "08:00",
      endTime: "17:00",
      graceMinutes: env.ATTENDANCE_GRACE_PERIOD_MINUTES,
      isOvernight: false,
      status: "ACTIVE",
    },
    update: {
      name: "Regular Day Shift",
      startTime: "08:00",
      endTime: "17:00",
      graceMinutes: env.ATTENDANCE_GRACE_PERIOD_MINUTES,
      isOvernight: false,
      status: "ACTIVE",
    },
  });

  const schedule = await prisma.shiftSchedule.upsert({
    where: {
      scheduleCode: "REGULAR_WEEKDAY",
    },
    create: {
      shiftId: shift.shiftId,
      scheduleCode: "REGULAR_WEEKDAY",
      name: "Regular Weekday Schedule",
      daysOfWeek: "MON,TUE,WED,THU,FRI",
      effectiveFrom: new Date("2026-01-01"),
      status: "ACTIVE",
    },
    update: {
      shiftId: shift.shiftId,
      name: "Regular Weekday Schedule",
      daysOfWeek: "MON,TUE,WED,THU,FRI",
      status: "ACTIVE",
    },
  });

  return {
    branch,
    department,
    designation,
    empType,
    schedule,
  };
}

async function seedAdminAccount(input: {
  branchId: number;
  departmentId: number;
  designationId: number;
  empTypeId: number;
  scheduleId: number;
}) {
  requireSeedPassword(env.SEED_ADMIN_PASSWORD);

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: {
      code: env.SEED_ADMIN_ROLE,
    },
  });

  const adminName = splitFullName(env.SEED_ADMIN_NAME);

  const employee = await prisma.employee.upsert({
    where: {
      empNumber: "SIS-ADMIN-0001",
    },
    create: {
      empNumber: "SIS-ADMIN-0001",
      firstName: adminName.firstName,
      middleName: adminName.middleName,
      lastName: adminName.lastName,
      email: env.SEED_ADMIN_EMAIL,
      branchId: input.branchId,
      departmentId: input.departmentId,
      designationId: input.designationId,
      empTypeId: input.empTypeId,
      scheduleId: input.scheduleId,
      isFlexible: true,
      status: "ACTIVE",
    },
    update: {
      firstName: adminName.firstName,
      middleName: adminName.middleName,
      lastName: adminName.lastName,
      email: env.SEED_ADMIN_EMAIL,
      branchId: input.branchId,
      departmentId: input.departmentId,
      designationId: input.designationId,
      empTypeId: input.empTypeId,
      scheduleId: input.scheduleId,
      isFlexible: true,
      status: "ACTIVE",
    },
  });

  const existingUser = await prisma.user.findUnique({
    where: {
      email: env.SEED_ADMIN_EMAIL,
    },
    select: {
      userId: true,
    },
  });

  if (existingUser) {
    await prisma.user.update({
      where: {
        userId: existingUser.userId,
      },
      data: {
        empId: employee.empId,
        username: env.SEED_ADMIN_USERNAME,
        roleId: adminRole.roleId,
        status: "ACTIVE",
        isLocked: false,
        lockoutUntil: null,
      },
    });

    return;
  }

  const passwordHash = await hash(
    env.SEED_ADMIN_PASSWORD,
    env.PASSWORD_HASH_ROUNDS,
  );

  await prisma.user.create({
    data: {
      empId: employee.empId,
      username: env.SEED_ADMIN_USERNAME,
      email: env.SEED_ADMIN_EMAIL,
      passwordHash,
      roleId: adminRole.roleId,
      mustChangePassword: true,
      failedAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
      status: "ACTIVE",
    },
  });
}

async function main() {
  console.log("Seeding Starland Attendance database...");

  await seedRolesAndPermissions();

  const defaults = await seedOrganizationDefaults();

  await seedAdminAccount({
    branchId: defaults.branch.branchId,
    departmentId: defaults.department.departmentId,
    designationId: defaults.designation.designationId,
    empTypeId: defaults.empType.empTypeId,
    scheduleId: defaults.schedule.scheduleId,
  });

  await prisma.activityLog.create({
    data: {
      action: "DATABASE_SEEDED",
      entityType: "system",
      entityId: "seed",
      newValue: {
        roles: seedRoles.length,
        permissions: seedPermissions.length,
        adminEmail: env.SEED_ADMIN_EMAIL,
      },
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });