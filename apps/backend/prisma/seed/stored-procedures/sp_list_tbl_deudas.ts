import type { PrismaClient } from "../../../prisma/schema/generated";

export async function seedSpListTblDeudas(prisma: PrismaClient) {
  // Lazy VENCIDA before listing
  await prisma.$executeRaw`
    UPDATE tbl_deuda d
    SET estado = 'VENCIDA'
    FROM tbl_deuda_grupo g
    WHERE d.grupo_id = g.id
      AND d.estado = 'PENDIENTE'
      AND g.fecha_vencimiento < CURRENT_DATE;
  `;

  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION sp_list_tbl_deudas(
      p_user_id TEXT,
      p_search TEXT DEFAULT NULL,
      p_page INT DEFAULT 1,
      p_page_size INT DEFAULT 10,
      p_sort_by TEXT DEFAULT 'created_at',
      p_sort_dir TEXT DEFAULT 'desc',
      p_direccion TEXT DEFAULT NULL,
      p_estado TEXT DEFAULT NULL
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
      v_where_clause TEXT := '';
      v_count_query TEXT;
      v_data_query TEXT;
      v_result JSONB;
    BEGIN
      UPDATE tbl_deuda d
      SET estado = 'VENCIDA'
      FROM tbl_deuda_grupo g
      WHERE d.grupo_id = g.id
        AND d.estado = 'PENDIENTE'
        AND g.fecha_vencimiento < CURRENT_DATE;

      IF p_page_size > 100 THEN p_page_size := 100; END IF;
      IF p_page_size < 1 THEN p_page_size := 10; END IF;
      IF p_page < 1 THEN p_page := 1; END IF;
      v_offset := (p_page - 1) * p_page_size;

      v_sort_expr := CASE p_sort_by
        WHEN 'fecha_vencimiento' THEN 'g.fecha_vencimiento'
        WHEN 'monto'             THEN 'd.monto'
        WHEN 'saldo_pendiente'   THEN 'd.saldo_pendiente'
        WHEN 'created_at'        THEN 'd.created_at'
        WHEN 'contraparte'       THEN 'd.contraparte_snapshot_nombre'
        ELSE 'd.created_at'
      END;

      v_order_dir := CASE p_sort_dir
        WHEN 'asc'  THEN 'ASC NULLS LAST'
        WHEN 'desc' THEN 'DESC NULLS LAST'
        ELSE 'DESC NULLS LAST'
      END;

      v_where_clause := '(d.acreedor_user_id = ' || quote_literal(p_user_id)
        || ' OR (d.deudor_user_id = ' || quote_literal(p_user_id) || ' AND d.espejo_de_id IS NULL))';

      IF p_direccion IS NOT NULL AND p_direccion <> '' THEN
        IF p_direccion = 'ME_DEBEN' THEN
          v_where_clause := 'd.acreedor_user_id = ' || quote_literal(p_user_id);
        ELSIF p_direccion = 'YO_DEBO' THEN
          v_where_clause := 'd.deudor_user_id = ' || quote_literal(p_user_id) || ' AND d.espejo_de_id IS NULL';
        END IF;
      END IF;

      IF p_estado IS NOT NULL AND p_estado <> '' THEN
        v_where_clause := '(' || v_where_clause || ') AND d.estado = ' || quote_literal(p_estado);
      END IF;

      IF p_search IS NOT NULL AND p_search <> '' THEN
        v_where_clause := '(' || v_where_clause || ') AND g.descripcion ILIKE ' || quote_literal('%' || p_search || '%');
      END IF;

      v_count_query := 'SELECT COUNT(*) FROM tbl_deuda d '
        || 'INNER JOIN tbl_deuda_grupo g ON g.id = d.grupo_id '
        || 'WHERE ' || v_where_clause;
      EXECUTE v_count_query INTO v_total;

      v_total_pages := CASE WHEN v_total > 0 THEN CEIL(v_total::FLOAT / p_page_size)::INT ELSE 0 END;

      v_data_query := 'SELECT json_agg(row_to_json(q)) FROM ('
        || 'SELECT '
        || 'd.id, '
        || 'd.grupo_id AS "groupId", '
        || 'g.direccion, '
        || 'g.descripcion, '
        || 'g.monto_base AS "montoBase", '
        || 'g.fecha_vencimiento AS "fechaVencimiento", '
        || 'g.auto_confirmar AS "autoConfirmar", '
        || 'd.acreedor_user_id AS "acreedorUserId", '
        || 'd.deudor_user_id AS "deudorUserId", '
        || 'd.deudor_nombre_libre AS "deudorNombreLibre", '
        || 'd.contraparte_snapshot_nombre AS "contraparteSnapshotNombre", '
        || 'd.contraparte_snapshot_avatar AS "contraparteSnapshotAvatar", '
        || 'd.espejo_de_id AS "espejoDeId", '
        || 'd.monto, '
        || 'd.saldo_pendiente AS "saldoPendiente", '
        || 'd.estado, '
        || 'd.auto_confirmar AS "autoConfirmar", '
        || 'd.created_at AS "createdAt", '
        || 'd.updated_at AS "updatedAt", '
        || '(SELECT json_build_object(''total'', COUNT(ab.id), ''confirmado'', COALESCE(SUM(ab.monto) FILTER (WHERE ab.estado = ''CONFIRMADO''), 0)) '
        || '  FROM tbl_deuda_abono ab WHERE ab.deuda_id = d.id) AS abonos, '
        || '(SELECT COUNT(*) FROM tbl_deuda_evento ev WHERE ev.deuda_id = d.id) AS "eventosCount" '
        || 'FROM tbl_deuda d '
        || 'INNER JOIN tbl_deuda_grupo g ON g.id = d.grupo_id '
        || 'WHERE ' || v_where_clause
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
