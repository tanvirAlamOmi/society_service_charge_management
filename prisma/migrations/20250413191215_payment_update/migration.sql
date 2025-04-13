/*
  Warnings:

  - You are about to drop the column `service_charge_id` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_service_charge_id_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "service_charge_id",
ADD COLUMN     "payment_method" TEXT DEFAULT 'CASH';
