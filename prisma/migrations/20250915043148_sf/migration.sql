/*
  Warnings:

  - The primary key for the `AreaAndServices` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."AreaAndServices" DROP CONSTRAINT "AreaAndServices_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AreaAndServices_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AreaAndServices_id_seq";
