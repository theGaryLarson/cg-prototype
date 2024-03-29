-- AlterTable
use `career-portal`;
ALTER TABLE `skill` ADD COLUMN `skill_class` ENUM('none', 'common', 'specialized', 'software') NOT NULL DEFAULT 'none';
