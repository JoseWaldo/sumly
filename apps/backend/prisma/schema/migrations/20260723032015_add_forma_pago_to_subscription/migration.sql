/*
  Warnings:

  - Added the required column `forma_pago_id` to the `tbl_subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_subscription" ADD COLUMN     "forma_pago_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tbl_subscription" ADD CONSTRAINT "tbl_subscription_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "tbl_forma_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
