-- CreateTable
CREATE TABLE "tbl_transaction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "description" VARCHAR(255),
    "category_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbl_transaction" ADD CONSTRAINT "tbl_transaction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tbl_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_transaction" ADD CONSTRAINT "tbl_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
