/*
  Warnings:

  - You are about to drop the `FlatRenter` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `flat_type` to the `Flat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FlatRenter" DROP CONSTRAINT "FlatRenter_flat_id_fkey";

-- DropForeignKey
ALTER TABLE "FlatRenter" DROP CONSTRAINT "FlatRenter_renter_id_fkey";

-- AlterTable
ALTER TABLE "Flat" ADD COLUMN     "flat_type" "FlatType" NOT NULL,
ADD COLUMN     "resident_id" INTEGER;

-- DropTable
DROP TABLE "FlatRenter";

-- CreateTable
CREATE TABLE "FlatResident" (
    "id" SERIAL NOT NULL,
    "flat_id" INTEGER NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlatResident_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlatResident" ADD CONSTRAINT "FlatResident_flat_id_fkey" FOREIGN KEY ("flat_id") REFERENCES "Flat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlatResident" ADD CONSTRAINT "FlatResident_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
