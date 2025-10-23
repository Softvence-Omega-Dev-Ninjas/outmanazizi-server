/*
  Warnings:

  - Added the required column `consumerId` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Bid" ADD COLUMN     "consumerId" TEXT NOT NULL;
