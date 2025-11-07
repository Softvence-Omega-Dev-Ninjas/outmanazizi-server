/*
  Warnings:

  - You are about to drop the column `body` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `fromNotification` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toNotification` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "body",
DROP COLUMN "data",
DROP COLUMN "isRead",
DROP COLUMN "userId",
ADD COLUMN     "fromNotification" TEXT NOT NULL,
ADD COLUMN     "toNotification" TEXT NOT NULL;
