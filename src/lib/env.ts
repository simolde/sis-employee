import { z } from "zod";

const booleanStringSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_SCHOOL_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  DATABASE_URL: z.string().min(1),

  SESSION_SECRET: z.string().min(64),
  SESSION_COOKIE_NAME: z.string().min(1).default("starland_attendance_session"),
  SESSION_MAX_AGE_DAYS: z.coerce.number().int().positive().default(7),

  PASSWORD_HASH_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  LOGIN_MAX_FAILED_ATTEMPTS: z.coerce.number().int().min(3).max(10).default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().min(1).max(60).default(5),

  SEED_ADMIN_NAME: z.string().min(1),
  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_USERNAME: z.string().min(3),
  SEED_ADMIN_PASSWORD: z.string().min(8),
  SEED_ADMIN_ROLE: z.string().min(1).default("SUPER_ADMIN"),

  ATTENDANCE_DEFAULT_BRANCH_ID: z.coerce.number().int().positive().default(1),
  ATTENDANCE_ALLOW_WEB_TIME_IN: booleanStringSchema.default(true),
  ATTENDANCE_REQUIRE_PHOTO: booleanStringSchema.default(true),
  ATTENDANCE_REQUIRE_LOCATION: booleanStringSchema.default(true),
  ATTENDANCE_GRACE_PERIOD_MINUTES: z.coerce
    .number()
    .int()
    .min(0)
    .max(60)
    .default(5),

  UPLOAD_DRIVER: z.enum(["local", "google_drive"]).default("local"),
  UPLOAD_DIR: z.string().min(1).default("uploads"),
  EMPLOYEE_PHOTO_DIR: z.string().min(1).default("uploads/employees"),
  ATTENDANCE_PHOTO_DIR: z.string().min(1).default("uploads/attendance"),
  MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(25).default(5),

  MAIL_DRIVER: z.enum(["smtp", "sync", "none"]).default("smtp"),
  MAIL_HOST: z.string().optional().default(""),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_SECURE: booleanStringSchema.default(false),
  MAIL_USER: z.string().optional().default(""),
  MAIL_PASSWORD: z.string().optional().default(""),
  MAIL_FROM_NAME: z.string().min(1).default("Starland Attendance"),
  MAIL_FROM_EMAIL: z.string().email(),

  GOOGLE_DRIVE_ENABLED: booleanStringSchema.default(false),
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_EMAIL: z.string().optional().default(""),
  GOOGLE_PRIVATE_KEY: z.string().optional().default(""),

  QUEUE_DRIVER: z.enum(["sync", "redis"]).default("sync"),
  REDIS_URL: z.string().optional().default(""),

  PORT: z.coerce.number().int().positive().default(3000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";