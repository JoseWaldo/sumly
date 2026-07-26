import type { PrismaClient } from "../../../prisma/schema/generated";
import { seedTblEntidadFinanciera } from "./tbl_entidad_financiera";

const TABLE_SEEDERS = {
  entidad_financiera: seedTblEntidadFinanciera,
} as const;

type TableKey = keyof typeof TABLE_SEEDERS;

export async function seedAllTables(prisma: PrismaClient) {
  console.log("Iniciando seed de tablas...");
  for (const [name, seeder] of Object.entries(TABLE_SEEDERS)) {
    console.log(`  → ${name}`);
    await seeder(prisma);
  }
  console.log("Seed de tablas completado.");
}

export async function seedTables(prisma: PrismaClient, names: TableKey[]) {
  console.log("Iniciando seed de tablas seleccionadas...");
  for (const name of names) {
    const seeder = TABLE_SEEDERS[name];
    if (!seeder) {
      console.warn(`  ✗ Tabla desconocida: "${name}"`);
      continue;
    }
    console.log(`  → ${name}`);
    await seeder(prisma);
  }
  console.log("Seed de tablas completado.");
}

export { TABLE_SEEDERS };
