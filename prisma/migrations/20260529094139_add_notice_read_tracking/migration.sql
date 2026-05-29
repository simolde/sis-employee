-- CreateTable
CREATE TABLE `notice_reads` (
    `notice_read_id` INTEGER NOT NULL AUTO_INCREMENT,
    `notice_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `read_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notice_reads_notice_id_idx`(`notice_id`),
    INDEX `notice_reads_user_id_idx`(`user_id`),
    UNIQUE INDEX `notice_reads_notice_id_user_id_key`(`notice_id`, `user_id`),
    PRIMARY KEY (`notice_read_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notice_reads` ADD CONSTRAINT `notice_reads_notice_id_fkey` FOREIGN KEY (`notice_id`) REFERENCES `notices`(`notice_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notice_reads` ADD CONSTRAINT `notice_reads_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
