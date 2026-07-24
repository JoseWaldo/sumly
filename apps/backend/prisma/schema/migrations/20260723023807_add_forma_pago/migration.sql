-- CreateEnum
CREATE TYPE "FormaPagoTipo" AS ENUM ('CREDIT', 'DEBIT', 'CASH');

-- CreateTable
CREATE TABLE "tbl_entidad_financiera" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "gradiente_inicio" TEXT NOT NULL,
    "gradiente_fin" TEXT NOT NULL,
    "formato_numero" TEXT,
    "es_sistema" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_entidad_financiera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_forma_pago" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "FormaPagoTipo" NOT NULL,
    "numero_encriptado" TEXT,
    "ultimos_cuatro" VARCHAR(4),
    "publico" BOOLEAN NOT NULL DEFAULT false,
    "gradiente_inicio" TEXT NOT NULL,
    "gradiente_fin" TEXT NOT NULL,
    "entidad_financiera_id" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_forma_pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_entidad_financiera_nombre_user_id_key" ON "tbl_entidad_financiera"("nombre", "user_id");

-- AddForeignKey
ALTER TABLE "tbl_entidad_financiera" ADD CONSTRAINT "tbl_entidad_financiera_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_forma_pago" ADD CONSTRAINT "tbl_forma_pago_entidad_financiera_id_fkey" FOREIGN KEY ("entidad_financiera_id") REFERENCES "tbl_entidad_financiera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_forma_pago" ADD CONSTRAINT "tbl_forma_pago_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
