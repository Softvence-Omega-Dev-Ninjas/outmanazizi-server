-- CreateEnum
CREATE TYPE "ServiceProviderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "status" "ServiceProviderStatus" NOT NULL DEFAULT 'PENDING';
