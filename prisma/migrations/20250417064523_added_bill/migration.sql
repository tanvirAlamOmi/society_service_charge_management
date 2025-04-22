/*
  Warnings:

  - Added the required column `bill_id` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "bill_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "flat_id" INTEGER NOT NULL,
    "society_id" INTEGER NOT NULL,
    "bill_month" DATE NOT NULL,
    "common_charges" JSONB NOT NULL,
    "flat_charges" JSONB NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_flat_id_fkey" FOREIGN KEY ("flat_id") REFERENCES "Flat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
