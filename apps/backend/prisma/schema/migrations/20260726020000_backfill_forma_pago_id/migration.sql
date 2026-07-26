-- Backfill: assign "Efectivo" payment method to all existing transactions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT t.user_id
    FROM tbl_transaction t
    WHERE t.forma_pago_id IS NULL
  LOOP
    UPDATE tbl_transaction t
    SET forma_pago_id = (
      SELECT fp.id
      FROM tbl_forma_pago fp
      WHERE fp.user_id = r.user_id AND fp.tipo = 'CASH'
      LIMIT 1
    )
    WHERE t.user_id = r.user_id AND t.forma_pago_id IS NULL
    AND EXISTS (
      SELECT 1 FROM tbl_forma_pago fp
      WHERE fp.user_id = r.user_id AND fp.tipo = 'CASH'
    );
  END LOOP;
END $$;

-- Make forma_pago_id NOT NULL after backfill
ALTER TABLE "tbl_transaction"
ALTER COLUMN "forma_pago_id" SET NOT NULL;

-- Drop old FK and recreate with NOT NULL constraint
ALTER TABLE "tbl_transaction"
DROP CONSTRAINT "fk_transaction_forma_pago";

ALTER TABLE "tbl_transaction"
ADD CONSTRAINT "fk_transaction_forma_pago"
FOREIGN KEY ("forma_pago_id") REFERENCES "tbl_forma_pago"("id")
ON DELETE RESTRICT;
