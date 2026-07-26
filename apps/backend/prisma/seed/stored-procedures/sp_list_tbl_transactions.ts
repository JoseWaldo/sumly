import type { PrismaClient } from "../../../prisma/schema/generated";

export async function seedSpListTblTransactions(prisma: PrismaClient) {
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION sp_list_tbl_transactions(
      p_user_id TEXT,
      p_search TEXT DEFAULT NULL,
      p_page INT DEFAULT 1,
      p_page_size INT DEFAULT 10,
      p_sort_by TEXT DEFAULT 'date',
      p_sort_dir TEXT DEFAULT 'desc',
      p_type TEXT DEFAULT NULL,
      p_category_id TEXT DEFAULT NULL,
      p_forma_pago_id TEXT DEFAULT NULL,
      p_date_from DATE DEFAULT NULL,
      p_date_to DATE DEFAULT NULL
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
        WHEN 'date'        THEN 't.date'
        WHEN 'amount'      THEN 't.amount'
        WHEN 'description' THEN 't.description'
        WHEN 'category'    THEN 'c.name'
        WHEN 'forma_pago'  THEN 'fp.nombre'
        ELSE 't.date'
      END;

      v_order_dir := CASE p_sort_dir
        WHEN 'asc'  THEN 'ASC NULLS LAST'
        WHEN 'desc' THEN 'DESC NULLS LAST'
        ELSE 'DESC NULLS LAST'
      END;

      v_where_clause := 'WHERE t.user_id = ' || quote_literal(p_user_id);

      IF p_search IS NOT NULL AND p_search <> '' THEN
        v_where_clause := v_where_clause || ' AND t.description ILIKE ' || quote_literal('%' || p_search || '%');
      END IF;
      IF p_type IS NOT NULL AND p_type <> '' THEN
        v_where_clause := v_where_clause || ' AND c.type = ' || quote_literal(p_type);
      END IF;
      IF p_category_id IS NOT NULL AND p_category_id <> '' THEN
        v_where_clause := v_where_clause || ' AND t.category_id = ' || quote_literal(p_category_id);
      END IF;
      IF p_forma_pago_id IS NOT NULL AND p_forma_pago_id <> '' THEN
        v_where_clause := v_where_clause || ' AND t.forma_pago_id = ' || quote_literal(p_forma_pago_id);
      END IF;
      IF p_date_from IS NOT NULL THEN
        v_where_clause := v_where_clause || ' AND t.date >= ' || quote_literal(p_date_from::TEXT) || '::DATE';
      END IF;
      IF p_date_to IS NOT NULL THEN
        v_where_clause := v_where_clause || ' AND t.date < ' || quote_literal(p_date_to::TEXT) || '::DATE + 1';
      END IF;

      v_count_query := 'SELECT COUNT(*) FROM tbl_transaction t '
        || 'INNER JOIN tbl_category c ON c.id = t.category_id '
        || 'LEFT JOIN tbl_forma_pago fp ON fp.id = t.forma_pago_id '
        || v_where_clause;
      EXECUTE v_count_query INTO v_total;

      v_total_pages := CASE WHEN v_total > 0 THEN CEIL(v_total::FLOAT / p_page_size)::INT ELSE 0 END;

      v_data_query := 'SELECT json_agg(row_to_json(q)) FROM ('
        || 'SELECT t.id, t.amount, t.date, t.description, t.category_id AS "categoryId", '
        || 't.user_id AS "userId", t.forma_pago_id AS "formaPagoId", '
        || 't.created_at AS "createdAt", t.updated_at AS "updatedAt", '
        || 'json_build_object(''id'', c.id, ''name'', c.name, ''type'', c.type, '
        || '''icon'', c.icon, ''userId'', c.user_id, '
        || '''createdAt'', c.created_at, ''updatedAt'', c.updated_at'
        || ') AS category, '
        || 'CASE WHEN fp.id IS NOT NULL THEN json_build_object('
        || '''id'', fp.id, ''nombre'', fp.nombre, ''tipo'', fp.tipo, '
        || '''ultimosCuatro'', fp.ultimos_cuatro, '
        || '''gradienteInicio'', fp.gradiente_inicio, '
        || '''gradienteFin'', fp.gradiente_fin'
        || ') ELSE NULL END AS "formaPago" '
        || 'FROM tbl_transaction t '
        || 'INNER JOIN tbl_category c ON c.id = t.category_id '
        || 'LEFT JOIN tbl_forma_pago fp ON fp.id = t.forma_pago_id '
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
