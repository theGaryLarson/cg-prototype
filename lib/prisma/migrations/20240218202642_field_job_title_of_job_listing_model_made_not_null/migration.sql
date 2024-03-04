/*
  Warnings:

  - Made the column `job_title` on table `job_listing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `job_listing` MODIFY `job_title` VARCHAR(255) NOT NULL;
