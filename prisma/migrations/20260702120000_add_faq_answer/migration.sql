-- AlterTable
ALTER TABLE `FrequentlyAskedQuestion` ADD COLUMN `answer` TEXT NULL;

-- Backfill existing rows before enforcing NOT NULL
UPDATE `FrequentlyAskedQuestion` SET `answer` = '' WHERE `answer` IS NULL;

ALTER TABLE `FrequentlyAskedQuestion` MODIFY `answer` TEXT NOT NULL;
