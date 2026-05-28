-- AlterTable
ALTER TABLE `notices` ADD COLUMN `audience` ENUM('ALL', 'HR_ADMIN', 'HEADS', 'STAFF_FACULTY_MAINTENANCE') NOT NULL DEFAULT 'ALL',
    ADD COLUMN `updated_by` INTEGER NULL;

-- CreateIndex
CREATE INDEX `notices_audience_idx` ON `notices`(`audience`);

-- CreateIndex
CREATE INDEX `notices_updated_by_idx` ON `notices`(`updated_by`);

-- AddForeignKey
ALTER TABLE `notices` ADD CONSTRAINT `notices_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
