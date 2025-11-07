/*
  Warnings:

  - You are about to drop the column `serviceProviderId` on the `Review` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_serviceProviderId_fkey";

-- AlterTable
ALTER TABLE "public"."Review" DROP COLUMN "serviceProviderId";
