-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);
