/*
  Warnings:

  - Added the required column `title` to the `proj_based_tech_assessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `proj_based_tech_assessment` ADD COLUMN `title` VARCHAR(255) NOT NULL;
