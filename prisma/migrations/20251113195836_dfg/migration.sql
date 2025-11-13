/*
  Warnings:

  - The `isSolved` column on the `Dispute` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Dispute" DROP COLUMN "isSolved",
ADD COLUMN     "isSolved" BOOLEAN NOT NULL DEFAULT false;
