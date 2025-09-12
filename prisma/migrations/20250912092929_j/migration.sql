/*
  Warnings:

  - You are about to drop the column `serviceProviderId` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_serviceProviderId_fkey";

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "serviceProviderId",
ADD COLUMN     "assignedServiceProviderId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_assignedServiceProviderId_fkey" FOREIGN KEY ("assignedServiceProviderId") REFERENCES "public"."ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
