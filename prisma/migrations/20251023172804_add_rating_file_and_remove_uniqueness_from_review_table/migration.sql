/*
  Warnings:

  - You are about to drop the column `getFromUsers` on the `ServiceProvider` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Review_userId_serviceProviderId_key";

-- AlterTable
ALTER TABLE "public"."ServiceProvider" DROP COLUMN "getFromUsers",
ADD COLUMN     "ratingGetFromUsers" INTEGER NOT NULL DEFAULT 0;
