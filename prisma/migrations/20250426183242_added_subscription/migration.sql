-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_society_id_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "society_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "society_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "payment_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "tran_id" TEXT,
    "payment_method" TEXT DEFAULT 'CASH',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tran_id_key" ON "Subscription"("tran_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "Society"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
