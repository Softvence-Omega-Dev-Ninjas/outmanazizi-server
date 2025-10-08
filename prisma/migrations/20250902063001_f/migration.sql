/*
  Warnings:

  - You are about to drop the column `confirmServiceProvider` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_serviceProviderId_fkey";

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "confirmServiceProvider",
ALTER COLUMN "serviceProviderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "public"."ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
