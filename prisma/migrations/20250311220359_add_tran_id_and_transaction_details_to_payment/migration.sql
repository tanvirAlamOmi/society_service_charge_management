/*
  Warnings:

  - A unique constraint covering the columns `[tran_id]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "tran_id" TEXT,
ADD COLUMN     "transaction_details" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_tran_id_key" ON "Payment"("tran_id");
