/*
  Warnings:

  - Added the required column `againstId` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Dispute` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_id_fkey";

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN     "againstId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_againstId_fkey" FOREIGN KEY ("againstId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
