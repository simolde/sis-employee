-- CreateTable
CREATE TABLE `attendance_exception_dates` (
    `exception_id` INTEGER NOT NULL AUTO_INCREMENT,
    `exception_date` DATE NOT NULL,
    `branch_id` INTEGER NULL,
    `exception_type` ENUM('HOLIDAY', 'CLASS_SUSPENSION', 'NO_WORK', 'SCHOOL_EVENT', 'REST_DAY', 'OTHER') NOT NULL DEFAULT 'HOLIDAY',
    `title` VARCHAR(160) NOT NULL,
    `description` TEXT NULL,
    `affects_absence_generation` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `attendance_exception_dates_exception_date_idx`(`exception_date`),
    INDEX `attendance_exception_dates_branch_id_idx`(`branch_id`),
    INDEX `attendance_exception_dates_exception_type_idx`(`exception_type`),
    INDEX `attendance_exception_dates_status_idx`(`status`),
    PRIMARY KEY (`exception_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
