/*
  Warnings:

  - You are about to drop the `JobApplication` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `providerId` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "public"."JobApplication" DROP CONSTRAINT "JobApplication_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobApplication" DROP CONSTRAINT "JobApplication_providerId_fkey";

-- AlterTable
ALTER TABLE "public"."Bid" ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "public"."JobApplication";
