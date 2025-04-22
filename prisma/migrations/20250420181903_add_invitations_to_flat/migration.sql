/*
  Warnings:

  - A unique constraint covering the columns `[flat_id,resident_id,end_date]` on the table `FlatResident` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SocietyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "flat_id" INTEGER;

-- AlterTable
ALTER TABLE "Society" ADD COLUMN     "status" "SocietyStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "FlatResident_flat_id_resident_id_end_date_key" ON "FlatResident"("flat_id", "resident_id", "end_date");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_flat_id_fkey" FOREIGN KEY ("flat_id") REFERENCES "Flat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
