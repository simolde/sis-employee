-- CreateTable
CREATE TABLE `employee_family_backgrounds` (
    `family_background_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `father_last_name` VARCHAR(100) NULL,
    `father_first_name` VARCHAR(100) NULL,
    `father_middle_name` VARCHAR(100) NULL,
    `father_address` TEXT NULL,
    `father_occupation` VARCHAR(191) NULL,
    `mother_last_name` VARCHAR(100) NULL,
    `mother_first_name` VARCHAR(100) NULL,
    `mother_middle_name` VARCHAR(100) NULL,
    `mother_address` TEXT NULL,
    `mother_occupation` VARCHAR(191) NULL,
    `spouse_last_name` VARCHAR(100) NULL,
    `spouse_first_name` VARCHAR(100) NULL,
    `spouse_middle_name` VARCHAR(100) NULL,
    `spouse_address` TEXT NULL,
    `spouse_occupation` VARCHAR(191) NULL,
    `employer` VARCHAR(191) NULL,
    `employer_address` TEXT NULL,
    `employer_phone` VARCHAR(40) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employee_family_backgrounds_emp_id_key`(`emp_id`),
    PRIMARY KEY (`family_background_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_children` (
    `child_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `date_of_birth` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `employee_children_emp_id_idx`(`emp_id`),
    PRIMARY KEY (`child_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_education_summaries` (
    `education_summary_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `let_passer` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employee_education_summaries_emp_id_key`(`emp_id`),
    PRIMARY KEY (`education_summary_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_educational_backgrounds` (
    `educational_background_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `level` ENUM('ELEMENTARY', 'SECONDARY', 'VOCATIONAL', 'COLLEGE', 'MASTERS', 'DOCTORATE') NOT NULL,
    `school_name` VARCHAR(191) NULL,
    `year_graduated` VARCHAR(50) NULL,
    `course` VARCHAR(191) NULL,
    `units` VARCHAR(80) NULL,
    `academic_honors` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `employee_educational_backgrounds_emp_id_idx`(`emp_id`),
    UNIQUE INDEX `employee_educational_backgrounds_emp_id_level_key`(`emp_id`, `level`),
    PRIMARY KEY (`educational_background_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_work_experiences` (
    `work_experience_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `inclusive_dates` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `employee_work_experiences_emp_id_idx`(`emp_id`),
    PRIMARY KEY (`work_experience_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_contracts` (
    `contract_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_id` INTEGER NOT NULL,
    `date_hired` DATE NOT NULL,
    `date_of_joining` DATE NOT NULL,
    `signature` VARCHAR(255) NOT NULL,
    `date_signed` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employee_contracts_emp_id_key`(`emp_id`),
    PRIMARY KEY (`contract_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_family_backgrounds` ADD CONSTRAINT `employee_family_backgrounds_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_children` ADD CONSTRAINT `employee_children_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_education_summaries` ADD CONSTRAINT `employee_education_summaries_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_educational_backgrounds` ADD CONSTRAINT `employee_educational_backgrounds_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_work_experiences` ADD CONSTRAINT `employee_work_experiences_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_contracts` ADD CONSTRAINT `employee_contracts_emp_id_fkey` FOREIGN KEY (`emp_id`) REFERENCES `employees`(`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;
