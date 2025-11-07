-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "customerIdFromStripe" TEXT,
ADD COLUMN     "paymentMethodIdFromStripe" TEXT;
