-- CreateEnum
CREATE TYPE "SubscriptionFrequency" AS ENUM ('MONTHLY', 'YEARLY', 'QUARTERLY', 'BIWEEKLY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "tbl_subscription_tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_subscription_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_subscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "next_payment_date" DATE NOT NULL,
    "frequency" "SubscriptionFrequency" NOT NULL DEFAULT 'MONTHLY',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SubscriptionToSubscriptionTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubscriptionToSubscriptionTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_subscription_tag_name_user_id_key" ON "tbl_subscription_tag"("name", "user_id");

-- CreateIndex
CREATE INDEX "_SubscriptionToSubscriptionTag_B_index" ON "_SubscriptionToSubscriptionTag"("B");

-- AddForeignKey
ALTER TABLE "tbl_subscription_tag" ADD CONSTRAINT "tbl_subscription_tag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_subscription" ADD CONSTRAINT "tbl_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubscriptionToSubscriptionTag" ADD CONSTRAINT "_SubscriptionToSubscriptionTag_A_fkey" FOREIGN KEY ("A") REFERENCES "tbl_subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubscriptionToSubscriptionTag" ADD CONSTRAINT "_SubscriptionToSubscriptionTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tbl_subscription_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
