/*
  Warnings:

  - You are about to drop the column `user_id` on the `UserServiceCharge` table. All the data in the column will be lost.
  - Added the required column `flat_id` to the `UserServiceCharge` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserServiceCharge" DROP CONSTRAINT "UserServiceCharge_user_id_fkey";

-- AlterTable
ALTER TABLE "UserServiceCharge" DROP COLUMN "user_id",
ADD COLUMN     "flat_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserServiceCharge" ADD CONSTRAINT "UserServiceCharge_flat_id_fkey" FOREIGN KEY ("flat_id") REFERENCES "Flat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
