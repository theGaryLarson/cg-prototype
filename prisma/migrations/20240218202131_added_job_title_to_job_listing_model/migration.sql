-- AlterTable
ALTER TABLE `job_listing` ADD COLUMN `job_title` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `sa_question` MODIFY `correct_answer_id` CHAR(36) NULL;
