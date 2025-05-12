/*
  Warnings:

  - The `status` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `RegistrationPayment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[session_id]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `end_date` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "SocietyStatus" ADD VALUE 'PAYMENT_PENDING';

-- DropForeignKey
ALTER TABLE "RegistrationPayment" DROP CONSTRAINT "RegistrationPayment_promo_id_fkey";

-- DropForeignKey
ALTER TABLE "RegistrationPayment" DROP CONSTRAINT "RegistrationPayment_society_id_fkey";

-- DropForeignKey
ALTER TABLE "RegistrationPayment" DROP CONSTRAINT "RegistrationPayment_user_id_fkey";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BDT',
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "promo_id" INTEGER,
ADD COLUMN     "session_id" TEXT,
ADD COLUMN     "transaction_details" JSONB,
ADD COLUMN     "user_id" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "end_date" SET NOT NULL,
ALTER COLUMN "payment_date" DROP DEFAULT,
ALTER COLUMN "payment_method" SET DEFAULT 'UNKNOWN';

-- DropTable
DROP TABLE "RegistrationPayment";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_session_id_key" ON "Subscription"("session_id");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "Promo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
