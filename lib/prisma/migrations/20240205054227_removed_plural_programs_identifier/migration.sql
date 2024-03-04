/*
  Warnings:

  - The primary key for the `training_program` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `training_programs_id` on the `training_program` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[training_program_id]` on the table `training_program` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `training_program_id` to the `training_program` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `training_program_id_UNIQUE` ON `training_program`;

-- AlterTable
ALTER TABLE `training_program` DROP PRIMARY KEY,
    DROP COLUMN `training_programs_id`,
    ADD COLUMN `training_program_id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`training_program_id`);

-- CreateIndex
CREATE UNIQUE INDEX `training_program_id_UNIQUE` ON `training_program`(`training_program_id`);
