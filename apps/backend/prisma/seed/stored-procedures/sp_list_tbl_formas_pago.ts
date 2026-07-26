import type { PrismaClient } from "../../../prisma/schema/generated";

export async function seedSpListTblFormasPago(prisma: PrismaClient) {
  await prisma.$executeRaw`
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
        || 'fp.gradiente_inicio AS "gradienteInicio", fp.gradiente_fin AS "gradienteFin", '
        || 'fp.entidad_financiera_id AS "entidadFinancieraId", fp.user_id AS "userId", '
        || 'fp.created_at AS "createdAt", fp.updated_at AS "updatedAt", '
        || 'CASE WHEN ef.id IS NOT NULL THEN json_build_object('
        || '''id'', ef.id, ''nombre'', ef.nombre, ''formatoNumero'', ef.formato_numero'
        || ') ELSE NULL END AS "entidadFinanciera" '
        || 'FROM tbl_forma_pago fp '
        || 'LEFT JOIN tbl_entidad_financiera ef ON ef.id = fp.entidad_financiera_id '
        || v_where_clause
        || ' ORDER BY ' || v_sort_expr || ' ' || v_order_dir
        || ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || ') q';
      EXECUTE v_data_query INTO v_result;

      RETURN jsonb_build_object(
        'data', COALESCE(v_result, '[]'::JSONB),
        'total', v_total, 'page', p_page,
        'pageSize', p_page_size, 'totalPages', v_total_pages
      );
    END;
    $$;
  `;
}
