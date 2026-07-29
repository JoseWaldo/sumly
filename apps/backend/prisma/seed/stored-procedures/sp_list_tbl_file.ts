import type { PrismaClient } from "../../../prisma/schema/generated";

export async function seedSpListTblFile(prisma: PrismaClient) {
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION sp_list_tbl_file(
      p_user_id TEXT,
      p_search TEXT DEFAULT NULL,
      p_page INT DEFAULT 1,
      p_page_size INT DEFAULT 10,
      p_sort_by TEXT DEFAULT 'created_at',
      p_sort_dir TEXT DEFAULT 'desc'
    )
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_offset INT;
      v_total BIGINT;
      v_total_pages INT;
      v_sort_expr TEXT;
      v_order_dir TEXT;
      v_where_clause TEXT;
      v_count_query TEXT;
      v_data_query TEXT;
      v_result JSONB;
    BEGIN
      IF p_page_size > 100 THEN p_page_size := 100; END IF;
      IF p_page_size < 1 THEN p_page_size := 10; END IF;
      IF p_page < 1 THEN p_page := 1; END IF;

      v_offset := (p_page - 1) * p_page_size;

      v_sort_expr := CASE p_sort_by
        WHEN 'original_name' THEN 'f.original_name'
        WHEN 'size_bytes'   THEN 'f.size_bytes'
        WHEN 'created_at'   THEN 'f.created_at'
        WHEN 'mime_type'    THEN 'f.mime_type'
        ELSE 'f.created_at'
      END;

      v_order_dir := CASE p_sort_dir
        WHEN 'asc'  THEN 'ASC NULLS LAST'
        WHEN 'desc' THEN 'DESC NULLS LAST'
        ELSE 'DESC NULLS LAST'
      END;

      v_where_clause := 'WHERE f.user_id = ' || quote_literal(p_user_id);

      IF p_search IS NOT NULL AND p_search <> '' THEN
        v_where_clause := v_where_clause || ' AND f.original_name ILIKE ' || quote_literal('%' || p_search || '%');
      END IF;

      v_count_query := 'SELECT COUNT(*) FROM tbl_file f ' || v_where_clause;
      EXECUTE v_count_query INTO v_total;

      v_total_pages := CASE WHEN v_total > 0 THEN CEIL(v_total::FLOAT / p_page_size)::INT ELSE 0 END;

      v_data_query := 'SELECT json_agg(row_to_json(q)) FROM ('
        || 'SELECT f.id, f.original_name AS "originalName", f.mime_type AS "mimeType", '
        || 'f.size_bytes AS "sizeBytes", f.s3_key AS "s3Key", '
        || 'f.user_id AS "userId", '
        || 'f.created_at AS "createdAt", f.updated_at AS "updatedAt" '
        || 'FROM tbl_file f '
        || v_where_clause
        || ' ORDER BY ' || v_sort_expr || ' ' || v_order_dir
        || ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset
        || ') q';

      EXECUTE v_data_query INTO v_result;

      RETURN jsonb_build_object(
        'data', COALESCE(v_result, '[]'::JSONB),
        'total', v_total,
        'page', p_page,
        'pageSize', p_page_size,
        'totalPages', v_total_pages
      );
    END;
    $$;
  `;
}
