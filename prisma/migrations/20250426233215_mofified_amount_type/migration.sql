/*
  Warnings:

  - You are about to alter the column `amount` on the `Subscription` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
