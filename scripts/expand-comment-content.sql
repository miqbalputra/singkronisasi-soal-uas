-- Run once against the existing MySQL database before deploying the chat update.
-- Widens the column without deleting existing messages.
ALTER TABLE `Comment` MODIFY COLUMN `content` TEXT NOT NULL;
