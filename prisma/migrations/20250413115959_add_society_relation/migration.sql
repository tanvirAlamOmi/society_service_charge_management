-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
