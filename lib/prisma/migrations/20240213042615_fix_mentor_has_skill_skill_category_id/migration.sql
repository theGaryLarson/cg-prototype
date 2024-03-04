/*
  Warnings:

  - You are about to drop the column `skill_category_skill_category_id` on the `mentor_has_skill` table. All the data in the column will be lost.
  - Added the required column `skill_category_id` to the `mentor_has_skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `mentor_has_skill` DROP FOREIGN KEY `fk_skill_category_has_mentor_skill_category1`;

-- AlterTable
ALTER TABLE `mentor_has_skill` DROP COLUMN `skill_category_skill_category_id`,
    ADD COLUMN `skill_category_id` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `fk_skill_category_has_mentor_skill_category1_idx` ON `mentor_has_skill`(`skill_category_id`);

-- AddForeignKey
ALTER TABLE `mentor_has_skill` ADD CONSTRAINT `fk_skill_category_has_mentor_skill_category1` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_category`(`skill_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
