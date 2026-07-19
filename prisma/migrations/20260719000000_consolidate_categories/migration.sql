-- Consolidate retail categories into Category.  Retail IDs become stable string
-- IDs (`retail-<legacy id>`) so existing retail products keep their category.
ALTER TABLE `RetailProduct` DROP FOREIGN KEY `RetailProduct_categoryId_fkey`;

RENAME TABLE `Category` TO `categories`;

ALTER TABLE `categories`
  DROP INDEX `Category_name_key`,
  ADD COLUMN `isRetail` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `RetailProduct` MODIFY `categoryId` VARCHAR(191) NOT NULL;

INSERT INTO `categories` (`id`, `name`, `image`, `appearOnHome`, `isWholesale`, `isRetail`, `createdAt`, `updatedAt`)
SELECT
  CONCAT('retail-', `id`),
  `name`,
  `image`,
  `appearOnHome`,
  false,
  true,
  `createdAt`,
  `updatedAt`
FROM `RetailCategory`;

UPDATE `RetailProduct`
SET `categoryId` = CONCAT('retail-', `categoryId`);

CREATE UNIQUE INDEX `Category_name_isWholesale_isRetail_key`
  ON `categories`(`name`, `isWholesale`, `isRetail`);

ALTER TABLE `RetailProduct`
  ADD CONSTRAINT `RetailProduct_categoryId_fkey`
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE `RetailCategory`;
