/*
  Warnings:

  - You are about to drop the column `appliedServiceProvider` on the `Service` table. All the data in the column will be lost.
  - Added the required column `serviceProviderId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "appliedServiceProvider",
ADD COLUMN     "serviceProviderId" TEXT NOT NULL,
ALTER COLUMN "confirmServiceProvider" SET NOT NULL,
ALTER COLUMN "confirmServiceProvider" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "public"."ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
