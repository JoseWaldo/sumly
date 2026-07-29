import type { PrismaClient } from "../../../prisma/schema/generated";
import { seedSpListTblTransactions } from "./sp_list_tbl_transactions";
import { seedSpListTblCategories } from "./sp_list_tbl_categories";
import { seedSpListTblSubscriptions } from "./sp_list_tbl_subscriptions";
import { seedSpListTblFormasPago } from "./sp_list_tbl_formas_pago";
import { seedSpListTblEntidadesFinancieras } from "./sp_list_tbl_entidades_financieras";
import { seedSpListTblFile } from "./sp_list_tbl_file";

const SP_SEEDERS = {
  transactions: seedSpListTblTransactions,
  categories: seedSpListTblCategories,
  subscriptions: seedSpListTblSubscriptions,
  formas_pago: seedSpListTblFormasPago,
  entidades_financieras: seedSpListTblEntidadesFinancieras,
  files: seedSpListTblFile,
} as const;

type SpKey = keyof typeof SP_SEEDERS;

export async function seedAllStoredProcedures(prisma: PrismaClient) {
  console.log("Creando stored procedures...");
  for (const [name, seeder] of Object.entries(SP_SEEDERS)) {
    console.log(`  → ${name}`);
    await seeder(prisma);
  }
  console.log("Stored procedures creados.");
}

export async function seedStoredProcedures(prisma: PrismaClient, names: SpKey[]) {
  console.log("Creando stored procedures seleccionados...");
  for (const name of names) {
    const seeder = SP_SEEDERS[name];
    if (!seeder) {
      console.warn(`  ✗ SP desconocido: "${name}"`);
      continue;
    }
    console.log(`  → ${name}`);
    await seeder(prisma);
  }
  console.log("Stored procedures creados.");
}

export { SP_SEEDERS };
