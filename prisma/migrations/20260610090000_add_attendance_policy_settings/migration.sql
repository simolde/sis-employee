CREATE TABLE `attendance_policy_settings` (
    `setting_id` INT NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT NOT NULL,
    `value_type` VARCHAR(20) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`setting_id`),
    UNIQUE INDEX `attendance_policy_settings_setting_key_key` (`setting_key`),
    INDEX `attendance_policy_settings_value_type_idx` (`value_type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `attendance_policy_settings` (
    `setting_key`,
    `setting_value`,
    `value_type`,
    `description`,
    `created_at`,
    `updated_at`
)
VALUES
(
    'DEFAULT_BRANCH_ID',
    '1',
    'INTEGER',
    'Default branch used when an attendance source does not provide a branch.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'ALLOW_WEB_TIME_IN',
    'true',
    'BOOLEAN',
    'Allows authorized employees to create attendance punches through the web application.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'ALLOW_MANUAL_TIME_IN',
    'false',
    'BOOLEAN',
    'Allows authorized staff to manually create or correct attendance punches.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'REQUIRE_PHOTO',
    'true',
    'BOOLEAN',
    'Requires photo evidence for attendance submissions.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'REQUIRE_LOCATION',
    'true',
    'BOOLEAN',
    'Requires latitude and longitude for attendance submissions.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'PHOTO_DIRECTORY',
    'uploads/attendance',
    'TEXT',
    'Relative local directory used for captured attendance photos.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'MAX_PHOTO_SIZE_MB',
    '5',
    'INTEGER',
    'Maximum allowed attendance photo size in megabytes.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'LATE_GRACE_MINUTES',
    '0',
    'INTEGER',
    'Number of minutes after the scheduled start before an employee is marked late.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'AUTO_MARK_MISSING_TIMEOUT',
    'true',
    'BOOLEAN',
    'Allows the attendance automation to mark records with missing time-out.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
),
(
    'MISSING_TIMEOUT_MINUTES',
    '720',
    'INTEGER',
    'Number of minutes after time-in before an open attendance record qualifies as missing time-out.',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
);