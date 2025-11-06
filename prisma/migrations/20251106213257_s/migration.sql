-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_serviceProviderId_fkey";

-- AlterTable
ALTER TABLE "public"."Review" ALTER COLUMN "serviceProviderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "public"."ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
