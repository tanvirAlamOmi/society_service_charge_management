-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_inviter_id_fkey";

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "inviter_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
