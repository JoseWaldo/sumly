-- CreateEnum
CREATE TYPE "DeudaDireccion" AS ENUM ('ME_DEBEN', 'YO_DEBO');

-- CreateEnum
CREATE TYPE "DeudaEstado" AS ENUM ('PENDIENTE', 'ESPERANDO_CONFIRMACION', 'PAGADA', 'DISPUTADA', 'VENCIDA', 'CANCELADA', 'PERDONADA');

-- CreateEnum
CREATE TYPE "DeudaAbonoEstado" AS ENUM ('PENDIENTE_CONFIRMACION', 'CONFIRMADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "MovimientoTipo" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "MovimientoNaturaleza" AS ENUM ('REAL', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "MovimientoOrigenTipo" AS ENUM ('MANUAL', 'DEUDA', 'AHORRO', 'SUSCRIPCION');

-- CreateTable
CREATE TABLE "tbl_deuda_grupo" (
    "id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "direccion" "DeudaDireccion" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto_base" DECIMAL(10,2) NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "auto_confirmar" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_deuda_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_deuda" (
    "id" TEXT NOT NULL,
    "grupo_id" TEXT,
    "acreedor_user_id" TEXT NOT NULL,
    "deudor_user_id" TEXT,
    "deudor_nombre_libre" TEXT,
    "contraparte_snapshot_nombre" TEXT NOT NULL,
    "contraparte_snapshot_avatar" TEXT,
    "espejo_de_id" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "saldo_pendiente" DECIMAL(10,2) NOT NULL,
    "estado" "DeudaEstado" NOT NULL DEFAULT 'PENDIENTE',
    "auto_confirmar" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_deuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_deuda_abono" (
    "id" TEXT NOT NULL,
    "deuda_id" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "estado" "DeudaAbonoEstado" NOT NULL DEFAULT 'PENDIENTE_CONFIRMACION',
    "forma_pago_id" TEXT NOT NULL,
    "comprobante_file_id" TEXT,
    "ai_review_status" TEXT,
    "ai_review_nota" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_deuda_abono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_deuda_evento" (
    "id" TEXT NOT NULL,
    "deuda_id" TEXT NOT NULL,
    "tipo_evento" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_deuda_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_movimiento" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "MovimientoTipo" NOT NULL,
    "naturaleza" "MovimientoNaturaleza" NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "origen_tipo" "MovimientoOrigenTipo" NOT NULL,
    "origen_id" TEXT,
    "reversa_de_id" TEXT,
    "editable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_deuda_espejo_de_id_key" ON "tbl_deuda"("espejo_de_id");

-- CreateIndex
CREATE INDEX "tbl_deuda_acreedor_user_id_idx" ON "tbl_deuda"("acreedor_user_id");

-- CreateIndex
CREATE INDEX "tbl_deuda_deudor_user_id_idx" ON "tbl_deuda"("deudor_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_deuda_abono_idempotency_key_key" ON "tbl_deuda_abono"("idempotency_key");

-- CreateIndex
CREATE INDEX "tbl_deuda_evento_deuda_id_created_at_idx" ON "tbl_deuda_evento"("deuda_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_movimiento_reversa_de_id_key" ON "tbl_movimiento"("reversa_de_id");

-- CreateIndex
CREATE INDEX "tbl_movimiento_usuario_id_created_at_idx" ON "tbl_movimiento"("usuario_id", "created_at");

-- CreateIndex
CREATE INDEX "tbl_movimiento_origen_tipo_origen_id_idx" ON "tbl_movimiento"("origen_tipo", "origen_id");

-- AddForeignKey
ALTER TABLE "tbl_deuda_grupo" ADD CONSTRAINT "tbl_deuda_grupo_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_deuda" ADD CONSTRAINT "tbl_deuda_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "tbl_deuda_grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_deuda" ADD CONSTRAINT "tbl_deuda_acreedor_user_id_fkey" FOREIGN KEY ("acreedor_user_id") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_deuda" ADD CONSTRAINT "tbl_deuda_deudor_user_id_fkey" FOREIGN KEY ("deudor_user_id") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_deuda" ADD CONSTRAINT "tbl_deuda_espejo_de_id_fkey" FOREIGN KEY ("espejo_de_id") REFERENCES "tbl_deuda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_deuda_abono" ADD CONSTRAINT "tbl_deuda_abono_deuda_id_fkey" FOREIGN KEY ("deuda_id") REFERENCES "tbl_deuda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_deuda_abono" ADD CONSTRAINT "tbl_deuda_abono_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "tbl_forma_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_deuda_abono" ADD CONSTRAINT "tbl_deuda_abono_comprobante_file_id_fkey" FOREIGN KEY ("comprobante_file_id") REFERENCES "tbl_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_deuda_evento" ADD CONSTRAINT "tbl_deuda_evento_deuda_id_fkey" FOREIGN KEY ("deuda_id") REFERENCES "tbl_deuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_movimiento" ADD CONSTRAINT "tbl_movimiento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_movimiento" ADD CONSTRAINT "tbl_movimiento_reversa_de_id_fkey" FOREIGN KEY ("reversa_de_id") REFERENCES "tbl_movimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
