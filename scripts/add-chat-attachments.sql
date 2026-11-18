-- Run once before deploying the chat attachment update. Existing rows are kept.
ALTER TABLE `Comment`
  MODIFY COLUMN `content` TEXT NOT NULL,
  ADD COLUMN `attachmentName` VARCHAR(255) NULL,
  ADD COLUMN `attachmentUrl` VARCHAR(512) NULL,
  ADD COLUMN `attachmentSize` INT NULL;
