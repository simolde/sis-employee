-- CreateTable
CREATE TABLE `branches` (
    `branch_id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `radius_m` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `branches_branch_code_key`(`branch_code`),
    PRIMARY KEY (`branch_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `department_id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_department_code_key`(`department_code`),
    PRIMARY KEY (`department_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `designations` (
    `designation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `designation_code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `designations_designation_code_key`(`designation_code`),
    PRIMARY KEY (`designation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emp_types` (
    `emp_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_type_code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `emp_types_emp_type_code_key`(`emp_type_code`),
    PRIMARY KEY (`emp_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `emp_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_number` VARCHAR(80) NOT NULL,
    `prc` VARCHAR(80) NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `middle_name` VARCHAR(100) NULL,
    `gender` VARCHAR(30) NULL,
    `dob` DATE NULL,
    `pob` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(40) NULL,
    `landline` VARCHAR(40) NULL,
    `civil_status` VARCHAR(60) NULL,
    `citizenship` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `branch_id` INTEGER NOT NULL,
    `department_id` INTEGER NULL,
    `designation_id` INTEGER NULL,
    `emp_type_id` INTEGER NULL,
    `schedule_id` INTEGER NULL,
    `is_flexible` BOOLEAN NOT NULL DEFAULT false,
    `av_leave` DOUBLE NOT NULL DEFAULT 0,
    `sss` VARCHAR(80) NULL,
    `pagibig` VARCHAR(80) NULL,
    `philhealth` VARCHAR(80) NULL,
    `tin` VARCHAR(80) NULL,
    `img` VARCHAR(255) NULL,
    `date_hired` DATE NULL,
    `date_signed` DATE NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'RESIGNED', 'TERMINATED', 'ON_LEAVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employees_emp_number_key`(`emp_number`),
    UNIQUE INDEX `employees_email_key`(`email`),
    INDEX `employees_branch_id_idx`(`branch_id`),
    INDEX `employees_department_id_idx`(`department_id`),
    INDEX `employees_designation_id_idx`(`designation_id`),
    INDEX `employees_emp_type_id_idx`(`emp_type_id`),
    INDEX `employees_schedule_id_idx`(`schedule_id`),
    INDEX `employees_status_idx`(`status`),
    PRIMARY KEY (`emp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_code_key`(`code`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `permission_id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(120) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `module` VARCHAR(80) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permissions_code_key`(`code`),
    INDEX `permissions_module_idx`(`module`),
    PRIMARY KEY (`permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `role_permissions_permission_id_idx`(`permission_id`),
    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    `failed_attempts` INTEGER NOT NULL DEFAULT 0,
    `is_locked` BOOLEAN NOT NULL DEFAULT false,
    `lockout_until` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_emp_id_key`(`emp_id`),
    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_id_idx`(`role_id`),
    INDEX `users_status_idx`(`status`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shifts` (
    `shift_id` INTEGER NOT NULL AUTO_INCREMENT,
    `shift_code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `start_time` VARCHAR(8) NOT NULL,
    `end_time` VARCHAR(8) NOT NULL,
    `grace_minutes` INTEGER NOT NULL DEFAULT 0,
    `is_overnight` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `shifts_shift_code_key`(`shift_code`),
    PRIMARY KEY (`shift_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift_schedules` (
    `schedule_id` INTEGER NOT NULL AUTO_INCREMENT,
    `shift_id` INTEGER NOT NULL,
    `schedule_code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `days_of_week` VARCHAR(50) NULL,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `shift_schedules_schedule_code_key`(`schedule_code`),
    INDEX `shift_schedules_shift_id_idx`(`shift_id`),
    INDEX `shift_schedules_status_idx`(`status`),
    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_schedule_assignments` (
    `assignment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `valid_from` DATE NOT NULL,
    `valid_to` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `assigned_by` INTEGER NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `employee_schedule_assignments_emp_id_idx`(`emp_id`),
    INDEX `employee_schedule_assignments_schedule_id_idx`(`schedule_id`),
    INDEX `employee_schedule_assignments_assigned_by_idx`(`assigned_by`),
    INDEX `employee_schedule_assignments_is_active_idx`(`is_active`),
    PRIMARY KEY (`assignment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfid_cards` (
    `rfid_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `rfid_uid` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED', 'LOST', 'REPLACED') NOT NULL DEFAULT 'ACTIVE',
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `disabled_at` DATETIME(3) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `rfid_cards_emp_id_idx`(`emp_id`),
    INDEX `rfid_cards_rfid_uid_idx`(`rfid_uid`),
    INDEX `rfid_cards_status_idx`(`status`),
    UNIQUE INDEX `rfid_cards_rfid_uid_status_key`(`rfid_uid`, `status`),
    PRIMARY KEY (`rfid_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance` (
    `attendance_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `schedule_id` INTEGER NULL,
    `att_date` DATE NOT NULL,
    `time_in` DATETIME(3) NULL,
    `in_remark` VARCHAR(120) NULL,
    `in_reason` TEXT NULL,
    `in_latitude` DECIMAL(10, 7) NULL,
    `in_longitude` DECIMAL(10, 7) NULL,
    `in_photo` VARCHAR(255) NULL,
    `in_source` ENUM('RFID', 'WEB', 'MANUAL', 'KIOSK', 'MOBILE') NULL,
    `in_branch_id` INTEGER NULL,
    `in_address` TEXT NULL,
    `time_out` DATETIME(3) NULL,
    `out_remark` VARCHAR(120) NULL,
    `out_reason` TEXT NULL,
    `out_latitude` DECIMAL(10, 7) NULL,
    `out_longitude` DECIMAL(10, 7) NULL,
    `out_photo` VARCHAR(255) NULL,
    `out_source` ENUM('RFID', 'WEB', 'MANUAL', 'KIOSK', 'MOBILE') NULL,
    `out_branch_id` INTEGER NULL,
    `out_address` TEXT NULL,
    `status` ENUM('ON_TIME', 'LATE', 'HALF_DAY', 'ABSENT', 'EXCUSED', 'PENDING_REVIEW', 'MISSING_TIMEOUT') NOT NULL DEFAULT 'PENDING_REVIEW',
    `total_minutes` INTEGER NULL,
    `is_synced` BOOLEAN NOT NULL DEFAULT true,
    `is_manual` BOOLEAN NOT NULL DEFAULT false,
    `verified_by` INTEGER NULL,
    `verified_at` DATETIME(3) NULL,
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `attendance_schedule_id_idx`(`schedule_id`),
    INDEX `attendance_att_date_idx`(`att_date`),
    INDEX `attendance_status_idx`(`status`),
    INDEX `attendance_in_branch_id_idx`(`in_branch_id`),
    INDEX `attendance_out_branch_id_idx`(`out_branch_id`),
    INDEX `attendance_verified_by_idx`(`verified_by`),
    INDEX `attendance_approved_by_idx`(`approved_by`),
    INDEX `attendance_created_by_idx`(`created_by`),
    INDEX `attendance_updated_by_idx`(`updated_by`),
    UNIQUE INDEX `attendance_emp_id_att_date_key`(`emp_id`, `att_date`),
    PRIMARY KEY (`attendance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_logs` (
    `log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `attendance_id` INTEGER NOT NULL,
    `emp_id` INTEGER NOT NULL,
    `punch_type` ENUM('TIME_IN', 'TIME_OUT', 'REPEATED_SCAN', 'MANUAL_EDIT', 'CORRECTION') NOT NULL,
    `punched_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `photo` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `source` ENUM('RFID', 'WEB', 'MANUAL', 'KIOSK', 'MOBILE') NOT NULL,
    `branch_id` INTEGER NULL,
    `remarks` VARCHAR(120) NULL,
    `reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attendance_logs_attendance_id_idx`(`attendance_id`),
    INDEX `attendance_logs_emp_id_idx`(`emp_id`),
    INDEX `attendance_logs_punched_at_idx`(`punched_at`),
    INDEX `attendance_logs_branch_id_idx`(`branch_id`),
    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_types` (
    `leave_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `leave_types_code_key`(`code`),
    PRIMARY KEY (`leave_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leaves` (
    `leave_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `leave_type_id` INTEGER NOT NULL,
    `date_from` DATE NOT NULL,
    `date_to` DATE NOT NULL,
    `total_days` DOUBLE NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,
    `rejection_reason` TEXT NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leaves_emp_id_idx`(`emp_id`),
    INDEX `leaves_leave_type_id_idx`(`leave_type_id`),
    INDEX `leaves_status_idx`(`status`),
    INDEX `leaves_approved_by_idx`(`approved_by`),
    INDEX `leaves_created_by_idx`(`created_by`),
    PRIMARY KEY (`leave_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notices` (
    `notice_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `branch_id` INTEGER NULL,
    `department_id` INTEGER NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `published_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notices_branch_id_idx`(`branch_id`),
    INDEX `notices_department_id_idx`(`department_id`),
    INDEX `notices_status_idx`(`status`),
    INDEX `notices_created_by_idx`(`created_by`),
    PRIMARY KEY (`notice_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `activity_log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `actor_user_id` INTEGER NULL,
    `action` VARCHAR(120) NOT NULL,
    `entity_type` VARCHAR(120) NOT NULL,
    `entity_id` VARCHAR(120) NULL,
    `old_value` JSON NULL,
    `new_value` JSON NULL,
    `ip_address` VARCHAR(80) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_actor_user_id_idx`(`actor_user_id`),
    INDEX `activity_logs_action_idx`(`action`),
    INDEX `activity_logs_entity_type_idx`(`entity_type`),
    INDEX `activity_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`activity_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`branch_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_designation_id_fkey` FOREIGN KEY (`designation_id`) REFERENCES `designations`(`designation_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_emp_type_id_fkey` FOREIGN KEY (`emp_type_id`) REFERENCES `emp_types`(`emp_type_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `shift_schedules`(`schedule_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift_schedules` ADD CONSTRAINT `shift_schedules_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`shift_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_schedule_assignments` ADD CONSTRAINT `employee_schedule_assignments_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_schedule_assignments` ADD CONSTRAINT `employee_schedule_assignments_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `shift_schedules`(`schedule_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_schedule_assignments` ADD CONSTRAINT `employee_schedule_assignments_assigned_by_fkey` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rfid_cards` ADD CONSTRAINT `rfid_cards_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `shift_schedules`(`schedule_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_in_branch_id_fkey` FOREIGN KEY (`in_branch_id`) REFERENCES `branches`(`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_out_branch_id_fkey` FOREIGN KEY (`out_branch_id`) REFERENCES `branches`(`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_logs` ADD CONSTRAINT `attendance_logs_attendance_id_fkey` FOREIGN KEY (`attendance_id`) REFERENCES `attendance`(`attendance_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_logs` ADD CONSTRAINT `attendance_logs_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_logs` ADD CONSTRAINT `attendance_logs_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaves` ADD CONSTRAINT `leaves_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaves` ADD CONSTRAINT `leaves_leave_type_id_fkey` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types`(`leave_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaves` ADD CONSTRAINT `leaves_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaves` ADD CONSTRAINT `leaves_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notices` ADD CONSTRAINT `notices_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notices` ADD CONSTRAINT `notices_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notices` ADD CONSTRAINT `notices_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
