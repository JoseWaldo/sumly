import type { PrismaClient } from "../../../prisma/schema/generated";

export async function seedSpListTblCategories(prisma: PrismaClient) {
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION sp_list_tbl_categories(
      p_user_id TEXT,
      p_search TEXT DEFAULT NULL,
      p_page INT DEFAULT 1,
      p_page_size INT DEFAULT 10,
      p_sort_by TEXT DEFAULT 'name',
      p_sort_dir TEXT DEFAULT 'asc',
      p_type TEXT DEFAULT NULL
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
        WHEN 'name' THEN 'c.name'
        WHEN 'type' THEN 'c.type'
        ELSE 'c.name'
      END;

      v_order_dir := CASE p_sort_dir
        WHEN 'asc'  THEN 'ASC NULLS LAST'
        WHEN 'desc' THEN 'DESC NULLS LAST'
        ELSE 'ASC NULLS LAST'
      END;

      v_where_clause := 'WHERE (c.user_id = ' || quote_literal(p_user_id) || ' OR c.user_id IS NULL)';
      IF p_search IS NOT NULL AND p_search <> '' THEN
        v_where_clause := v_where_clause || ' AND c.name ILIKE ' || quote_literal('%' || p_search || '%');
      END IF;
      IF p_type IS NOT NULL AND p_type <> '' THEN
        v_where_clause := v_where_clause || ' AND c.type = ' || quote_literal(p_type);
      END IF;

      v_count_query := 'SELECT COUNT(*) FROM tbl_category c ' || v_where_clause;
      EXECUTE v_count_query INTO v_total;
      v_total_pages := CASE WHEN v_total > 0 THEN CEIL(v_total::FLOAT / p_page_size)::INT ELSE 0 END;

      v_data_query := 'SELECT json_agg(row_to_json(q)) FROM ('
        || 'SELECT c.id, c.name, c.type, c.icon, c.user_id AS "userId", '
        || 'c.created_at AS "createdAt", c.updated_at AS "updatedAt" '
        || 'FROM tbl_category c ' || v_where_clause
        || ' ORDER BY ' || v_sort_expr || ' ' || v_order_dir
        || ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || ') q';
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
