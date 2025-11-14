/*
  Warnings:

  - You are about to drop the column `bidId` on the `Dispute` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_bidId_fkey";

-- AlterTable
ALTER TABLE "Dispute" DROP COLUMN "bidId";
