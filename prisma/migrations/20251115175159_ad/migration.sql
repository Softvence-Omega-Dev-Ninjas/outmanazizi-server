/*
  Warnings:

  - Added the required column `paymentIntentId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentIntentId" TEXT NOT NULL;
