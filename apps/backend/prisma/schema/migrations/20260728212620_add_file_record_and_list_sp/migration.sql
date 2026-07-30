-- Create tbl_file
CREATE TABLE "tbl_file" (
  "id" TEXT NOT NULL,
  "original_name" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "s3_key" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tbl_file_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_file_user" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE
);
