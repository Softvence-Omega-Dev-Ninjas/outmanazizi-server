/*
  Warnings:

  - The primary key for the `PlatformFee` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "PlatformFee" DROP CONSTRAINT "PlatformFee_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PlatformFee_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PlatformFee_id_seq";
