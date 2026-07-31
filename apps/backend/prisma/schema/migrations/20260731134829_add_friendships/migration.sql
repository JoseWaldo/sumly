-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');

-- DropForeignKey
ALTER TABLE "tbl_file" DROP CONSTRAINT "fk_file_user";

-- DropForeignKey
ALTER TABLE "tbl_transaction" DROP CONSTRAINT "fk_transaction_forma_pago";

-- CreateTable
CREATE TABLE "tbl_friendship" (
    "id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "addressee_id" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "previous_status" "FriendshipStatus",
    "blocked_by_id" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_friendship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbl_transaction" ADD CONSTRAINT "tbl_transaction_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "tbl_forma_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_file" ADD CONSTRAINT "tbl_file_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_friendship" ADD CONSTRAINT "tbl_friendship_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_friendship" ADD CONSTRAINT "tbl_friendship_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_friendship" ADD CONSTRAINT "tbl_friendship_blocked_by_id_fkey" FOREIGN KEY ("blocked_by_id") REFERENCES "tbl_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex (pair uniqueness regardless of direction)
CREATE UNIQUE INDEX "tbl_friendship_pair_unique"
  ON "tbl_friendship" (LEAST("requester_id", "addressee_id"), GREATEST("requester_id", "addressee_id"));

-- CreateFunction: sp_list_tbl_friendships
CREATE OR REPLACE FUNCTION sp_list_tbl_friendships(
  p_user_id TEXT,
  p_search TEXT DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 20,
  p_sort_by TEXT DEFAULT 'createdAt',
  p_sort_dir TEXT DEFAULT 'desc',
  p_status TEXT DEFAULT NULL,
  p_perspective TEXT DEFAULT 'either'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INT;
  v_count BIGINT;
  v_total_pages INT;
  v_sort_expr TEXT;
  v_order_dir TEXT;
  v_where_perspective TEXT;
  v_where_status TEXT;
  v_search_clause TEXT;
  v_results JSONB;
  v_query TEXT;
BEGIN
  IF p_page < 1 THEN
    p_page := 1;
  END IF;

  IF p_page_size > 100 THEN
    p_page_size := 100;
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  -- Sort whitelist
  v_sort_expr := CASE p_sort_by
    WHEN 'createdAt' THEN 'f.created_at'
    WHEN 'name' THEN 'ou.name'
    ELSE 'f.created_at'
  END;

  -- Sort direction whitelist
  v_order_dir := CASE p_sort_dir
    WHEN 'asc' THEN 'ASC NULLS LAST'
    WHEN 'desc' THEN 'DESC NULLS LAST'
    ELSE 'DESC NULLS LAST'
  END;

  -- Perspective filter
  v_where_perspective := CASE p_perspective
    WHEN 'requester' THEN 'f.requester_id = ' || quote_literal(p_user_id)
    WHEN 'addressee' THEN 'f.addressee_id = ' || quote_literal(p_user_id)
    ELSE '(f.requester_id = ' || quote_literal(p_user_id) || ' OR f.addressee_id = ' || quote_literal(p_user_id) || ')'
  END;

  -- Status filter
  IF p_status IS NOT NULL THEN
    v_where_status := ' AND f.status = ''' || p_status || '''';
  ELSE
    v_where_status := '';
  END IF;

  -- Search filter
  IF p_search IS NOT NULL AND p_search != '' THEN
    v_search_clause := ' AND (LOWER(ou.name) LIKE ''%'' || LOWER(' || quote_literal(p_search) || ') || ''%'' OR LOWER(ou.email) LIKE ''%'' || LOWER(' || quote_literal(p_search) || ') || ''%'')';
  ELSE
    v_search_clause := '';
  END IF;

  -- Count query
  v_query := 'SELECT COUNT(*) FROM "tbl_friendship" f ' ||
    'JOIN "tbl_user" ou ON ou.id = CASE WHEN f.requester_id = ' || quote_literal(p_user_id) || ' THEN f.addressee_id ELSE f.requester_id END ' ||
    'WHERE ' || v_where_perspective || v_where_status || v_search_clause;

  EXECUTE v_query INTO v_count;

  -- Data query
  v_query := 'SELECT json_agg(row_to_json(q)) FROM ( ' ||
    'SELECT f.id, f.requester_id AS "requesterId", f.addressee_id AS "addresseeId", ' ||
    'f.status, f.blocked_by_id AS "blockedById", f.responded_at AS "respondedAt", ' ||
    'f.created_at AS "createdAt", f.updated_at AS "updatedAt", ' ||
    'json_build_object( ' ||
    '''id'', ou.id, ' ||
    '''name'', ou.name, ' ||
    '''image'', ou.image, ' ||
    '''email'', ou.email ' ||
    ') AS "otherUser" ' ||
    'FROM "tbl_friendship" f ' ||
    'JOIN "tbl_user" ou ON ou.id = CASE WHEN f.requester_id = ' || quote_literal(p_user_id) || ' THEN f.addressee_id ELSE f.requester_id END ' ||
    'WHERE ' || v_where_perspective || v_where_status || v_search_clause ||
    ' ORDER BY ' || v_sort_expr || ' ' || v_order_dir ||
    ' OFFSET ' || v_offset || ' LIMIT ' || p_page_size ||
  ') q';

  EXECUTE v_query INTO v_results;

  IF v_results IS NULL THEN
    v_results := '[]'::JSONB;
  END IF;

  v_total_pages := CASE WHEN v_count > 0 THEN CEIL(v_count::FLOAT / p_page_size) ELSE 0 END;

  RETURN jsonb_build_object(
    'data', v_results,
    'total', v_count,
    'page', p_page,
    'pageSize', p_page_size,
    'totalPages', v_total_pages
  );
END;
$$;
