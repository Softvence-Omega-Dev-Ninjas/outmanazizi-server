/*
  Warnings:

  - Added the required column `serviceid` to the `Dispute` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_bidId_fkey";

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN     "serviceid" TEXT NOT NULL,
ALTER COLUMN "bidId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_serviceid_fkey" FOREIGN KEY ("serviceid") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
