-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "provider" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
