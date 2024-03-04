/*
  Warnings:

  - You are about to drop the column `correct_answer_id` on the `sa_question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sa_possible_answer` ADD COLUMN `is_correct` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `sa_question` DROP COLUMN `correct_answer_id`;
