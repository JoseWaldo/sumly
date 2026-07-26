-- Add forma_pago_id to tbl_transaction (nullable initially for migration)
ALTER TABLE "tbl_transaction"
ADD COLUMN "forma_pago_id" TEXT;

ALTER TABLE "tbl_transaction"
ADD CONSTRAINT "fk_transaction_forma_pago"
FOREIGN KEY ("forma_pago_id") REFERENCES "tbl_forma_pago"("id")
ON DELETE SET NULL;

-- ============================================================================
-- Stored Procedures: Standardized List/Pagination
-- ============================================================================

-- ----------------------------------------------------------------------------
-- sp_list_tbl_transactions
-- ----------------------------------------------------------------------------
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
    || 'SELECT '
    || 't.id, t.amount, t.date, t.description, t.category_id AS "categoryId", '
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

-- ----------------------------------------------------------------------------
-- sp_list_tbl_categories
-- ----------------------------------------------------------------------------
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
    || 'FROM tbl_category c '
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

-- ----------------------------------------------------------------------------
-- sp_list_tbl_subscriptions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_list_tbl_subscriptions(
  p_user_id TEXT,
  p_search TEXT DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 12,
  p_sort_by TEXT DEFAULT 'nextPaymentDate',
  p_sort_dir TEXT DEFAULT 'asc',
  p_status TEXT DEFAULT NULL,
  p_tag_id TEXT DEFAULT NULL
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
  IF p_page_size < 1 THEN p_page_size := 12; END IF;
  IF p_page < 1 THEN p_page := 1; END IF;

  v_offset := (p_page - 1) * p_page_size;

  v_sort_expr := CASE p_sort_by
    WHEN 'name'            THEN 's.name'
    WHEN 'amount'          THEN 's.amount'
    WHEN 'nextPaymentDate' THEN 's.next_payment_date'
    WHEN 'status'          THEN 's.status'
    WHEN 'frequency'       THEN 's.frequency'
    ELSE 's.next_payment_date'
  END;

  v_order_dir := CASE p_sort_dir
    WHEN 'asc'  THEN 'ASC NULLS LAST'
    WHEN 'desc' THEN 'DESC NULLS LAST'
    ELSE 'ASC NULLS LAST'
  END;

  v_where_clause := 'WHERE s.user_id = ' || quote_literal(p_user_id);

  IF p_search IS NOT NULL AND p_search <> '' THEN
    v_where_clause := v_where_clause || ' AND s.name ILIKE ' || quote_literal('%' || p_search || '%');
  END IF;

  IF p_status IS NOT NULL AND p_status <> '' THEN
    v_where_clause := v_where_clause || ' AND s.status = ' || quote_literal(p_status);
  END IF;

  IF p_tag_id IS NOT NULL AND p_tag_id <> '' THEN
    v_where_clause := v_where_clause || ' AND EXISTS ('
      || 'SELECT 1 FROM "_SubscriptionToSubscriptionTag" st '
      || 'WHERE st."A" = s.id AND st."B" = ' || quote_literal(p_tag_id) || ')';
  END IF;

  v_count_query := 'SELECT COUNT(*) FROM tbl_subscription s ' || v_where_clause;
  EXECUTE v_count_query INTO v_total;

  v_total_pages := CASE WHEN v_total > 0 THEN CEIL(v_total::FLOAT / p_page_size)::INT ELSE 0 END;

  v_data_query := 'SELECT json_agg(row_to_json(q)) FROM ('
    || 'SELECT s.id, s.name, s.amount, s.next_payment_date AS "nextPaymentDate", '
    || 's.frequency, s.status, s.user_id AS "userId", '
    || 's.forma_pago_id AS "formaPagoId", '
    || 's.created_at AS "createdAt", s.updated_at AS "updatedAt", '
    || 'json_build_object(''id'', fp.id, ''nombre'', fp.nombre, ''tipo'', fp.tipo, '
    || '''ultimosCuatro'', fp.ultimos_cuatro, '
    || '''gradienteInicio'', fp.gradiente_inicio, '
    || '''gradienteFin'', fp.gradiente_fin, '
    || '''entidadFinancieraId'', fp.entidad_financiera_id, '
    || '''entidadFinanciera'', CASE WHEN ef.id IS NOT NULL THEN json_build_object('
    || '''id'', ef.id, ''nombre'', ef.nombre, ''formatoNumero'', ef.formato_numero'
    || ') ELSE NULL END'
    || ') AS "formaPago", '
    || 'COALESCE((SELECT json_agg(json_build_object(''id'', st.id, ''name'', st.name, '
    || '''color'', st.color, ''userId'', st.user_id, '
    || '''createdAt'', st.created_at, ''updatedAt'', st.updated_at'
    || ')) FROM "_SubscriptionToSubscriptionTag" j '
    || 'INNER JOIN tbl_subscription_tag st ON st.id = j."B" '
    || 'WHERE j."A" = s.id), ''[]''::JSON) AS tags '
    || 'FROM tbl_subscription s '
    || 'LEFT JOIN tbl_forma_pago fp ON fp.id = s.forma_pago_id '
    || 'LEFT JOIN tbl_entidad_financiera ef ON ef.id = fp.entidad_financiera_id '
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

-- ----------------------------------------------------------------------------
-- sp_list_tbl_formas_pago
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_list_tbl_formas_pago(
  p_user_id TEXT,
  p_search TEXT DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 24,
  p_sort_by TEXT DEFAULT 'tipo',
  p_sort_dir TEXT DEFAULT 'asc'
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
  IF p_page_size < 1 THEN p_page_size := 24; END IF;
  IF p_page < 1 THEN p_page := 1; END IF;

  v_offset := (p_page - 1) * p_page_size;

  v_sort_expr := CASE p_sort_by
    WHEN 'tipo'   THEN 'fp.tipo'
    WHEN 'nombre' THEN 'fp.nombre'
    ELSE 'fp.tipo'
  END;

  v_order_dir := CASE p_sort_dir
    WHEN 'asc'  THEN 'ASC NULLS LAST'
    WHEN 'desc' THEN 'DESC NULLS LAST'
    ELSE 'ASC NULLS LAST'
  END;

  v_where_clause := 'WHERE fp.user_id = ' || quote_literal(p_user_id);

  IF p_search IS NOT NULL AND p_search <> '' THEN
    v_where_clause := v_where_clause || ' AND fp.nombre ILIKE ' || quote_literal('%' || p_search || '%');
  END IF;

  v_count_query := 'SELECT COUNT(*) FROM tbl_forma_pago fp ' || v_where_clause;
  EXECUTE v_count_query INTO v_total;

  v_total_pages := CASE WHEN v_total > 0 THEN CEIL(v_total::FLOAT / p_page_size)::INT ELSE 0 END;

  v_data_query := 'SELECT json_agg(row_to_json(q)) FROM ('
    || 'SELECT fp.id, fp.nombre, fp.tipo, fp.numero_encriptado AS "numeroEncriptado", '
    || 'fp.ultimos_cuatro AS "ultimosCuatro", fp.publico, '
    || 'fp.gradiente_inicio AS "gradienteInicio", '
    || 'fp.gradiente_fin AS "gradienteFin", '
    || 'fp.entidad_financiera_id AS "entidadFinancieraId", '
    || 'fp.user_id AS "userId", '
    || 'fp.created_at AS "createdAt", fp.updated_at AS "updatedAt", '
    || 'CASE WHEN ef.id IS NOT NULL THEN json_build_object('
    || '''id'', ef.id, ''nombre'', ef.nombre, ''formatoNumero'', ef.formato_numero'
    || ') ELSE NULL END AS "entidadFinanciera" '
    || 'FROM tbl_forma_pago fp '
    || 'LEFT JOIN tbl_entidad_financiera ef ON ef.id = fp.entidad_financiera_id '
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

-- ----------------------------------------------------------------------------
-- sp_list_tbl_entidades_financieras
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_list_tbl_entidades_financieras(
  p_user_id TEXT,
  p_search TEXT DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_sort_by TEXT DEFAULT 'nombre',
  p_sort_dir TEXT DEFAULT 'asc'
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
  IF p_page_size < 1 THEN p_page_size := 50; END IF;
  IF p_page < 1 THEN p_page := 1; END IF;

  v_offset := (p_page - 1) * p_page_size;

  v_sort_expr := CASE p_sort_by
    WHEN 'nombre'    THEN 'ef.nombre'
    WHEN 'esSistema' THEN 'ef.es_sistema'
    ELSE 'ef.nombre'
  END;

  v_order_dir := CASE p_sort_dir
    WHEN 'asc'  THEN 'ASC NULLS LAST'
    WHEN 'desc' THEN 'DESC NULLS LAST'
    ELSE 'ASC NULLS LAST'
  END;

  v_where_clause := 'WHERE (ef.user_id = ' || quote_literal(p_user_id) || ' OR ef.user_id IS NULL)';

  IF p_search IS NOT NULL AND p_search <> '' THEN
    v_where_clause := v_where_clause || ' AND ef.nombre ILIKE ' || quote_literal('%' || p_search || '%');
  END IF;

  v_count_query := 'SELECT COUNT(*) FROM tbl_entidad_financiera ef ' || v_where_clause;
  EXECUTE v_count_query INTO v_total;

  v_total_pages := CASE WHEN v_total > 0 THEN CEIL(v_total::FLOAT / p_page_size)::INT ELSE 0 END;

  v_data_query := 'SELECT json_agg(row_to_json(q)) FROM ('
    || 'SELECT ef.id, ef.nombre, ef.gradiente_inicio AS "gradienteInicio", '
    || 'ef.gradiente_fin AS "gradienteFin", ef.formato_numero AS "formatoNumero", '
    || 'ef.es_sistema AS "esSistema", ef.user_id AS "userId", '
    || 'ef.created_at AS "createdAt", ef.updated_at AS "updatedAt" '
    || 'FROM tbl_entidad_financiera ef '
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
