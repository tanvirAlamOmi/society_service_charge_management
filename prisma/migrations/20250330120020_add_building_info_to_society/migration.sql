/*
  Warnings:

  - You are about to drop the column `flats` on the `Society` table. All the data in the column will be lost.
  - You are about to drop the column `owners` on the `Society` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Society" DROP COLUMN "flats",
DROP COLUMN "owners",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "state" TEXT;
