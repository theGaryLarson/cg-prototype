/*
  Warnings:

  - You are about to drop the column `mentor_mentor_id` on the `mentor_has_skill` table. All the data in the column will be lost.
  - Added the required column `mentor_id` to the `mentor_has_skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `mentor_has_skill` DROP FOREIGN KEY `fk_skill_category_has_mentor_mentor1`;

-- AlterTable
ALTER TABLE `mentor_has_skill` DROP COLUMN `mentor_mentor_id`,
    ADD COLUMN `mentor_id` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `fk_skill_category_has_mentor_mentor1_idx` ON `mentor_has_skill`(`mentor_id`);

-- AddForeignKey
ALTER TABLE `mentor_has_skill` ADD CONSTRAINT `fk_skill_category_has_mentor_mentor1` FOREIGN KEY (`mentor_id`) REFERENCES `mentor`(`mentor_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
