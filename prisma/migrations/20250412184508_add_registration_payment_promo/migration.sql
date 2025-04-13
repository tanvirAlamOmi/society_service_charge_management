/*
  Warnings:

  - The `status` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `flat_id` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('EXPIRY_DATE', 'USER_BASED', 'LOCATION_BASED', 'AMOUNT_BASED', 'FLAT_BASED');

-- CreateEnum
CREATE TYPE "PromoStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'INACTIVE');

-- AlterTable
ALTER TABLE "Flat" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FlatResident" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BDT',
ADD COLUMN     "flat_id" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ServiceCharge" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Society" ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserServiceCharge" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "RegistrationPayment" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT,
    "tran_id" TEXT,
    "email" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "society_id" INTEGER,
    "user_id" INTEGER,
    "promo_id" INTEGER,
    "transaction_details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promo" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "max_discount" DOUBLE PRECISION,
    "min_amount" DOUBLE PRECISION,
    "expiry_date" TIMESTAMP(3),
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "location_radius" DOUBLE PRECISION,
    "location_area" TEXT,
    "flat_type" "FlatType",
    "user_id" INTEGER,
    "status" "PromoStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationPayment_session_id_key" ON "RegistrationPayment"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Promo_code_key" ON "Promo"("code");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_flat_id_fkey" FOREIGN KEY ("flat_id") REFERENCES "Flat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationPayment" ADD CONSTRAINT "RegistrationPayment_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "Society"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationPayment" ADD CONSTRAINT "RegistrationPayment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationPayment" ADD CONSTRAINT "RegistrationPayment_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "Promo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
