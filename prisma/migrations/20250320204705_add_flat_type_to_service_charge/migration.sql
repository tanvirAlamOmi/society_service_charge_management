/*
  Warnings:

  - Added the required column `flat_type` to the `ServiceCharge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FlatType" AS ENUM ('TWO_BHK', 'THREE_BHK', 'FOUR_BHK');

-- AlterTable
ALTER TABLE "ServiceCharge" ADD COLUMN     "flat_type" "FlatType" NOT NULL;
