-- RenameTable
ALTER TABLE "User" RENAME TO "tbl_user";

-- RenameTable
ALTER TABLE "Session" RENAME TO "tbl_session";

-- RenameTable
ALTER TABLE "Account" RENAME TO "tbl_account";

-- RenameTable
ALTER TABLE "Verification" RENAME TO "tbl_verification";

-- RenameIndex
ALTER INDEX "User_pkey" RENAME TO "tbl_user_pkey";
ALTER INDEX "Session_pkey" RENAME TO "tbl_session_pkey";
ALTER INDEX "Account_pkey" RENAME TO "tbl_account_pkey";
ALTER INDEX "Verification_pkey" RENAME TO "tbl_verification_pkey";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "tbl_user_email_key";
ALTER INDEX "Session_token_key" RENAME TO "tbl_session_token_key";
ALTER INDEX "Account_provider_id_account_id_key" RENAME TO "tbl_account_provider_id_account_id_key";

-- RenameForeignKey
ALTER TABLE "tbl_session" RENAME CONSTRAINT "Session_user_id_fkey" TO "tbl_session_user_id_fkey";
ALTER TABLE "tbl_account" RENAME CONSTRAINT "Account_user_id_fkey" TO "tbl_account_user_id_fkey";
