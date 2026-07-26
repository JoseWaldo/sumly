import { prisma } from "../src/db";
import { seedAllStoredProcedures, seedStoredProcedures, SP_SEEDERS } from "./stored-procedures/index";
import { seedAllTables, seedTables, TABLE_SEEDERS } from "./tables/index";

function parseListArg(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const args = process.argv.slice(2);

  const isLegacy = args.includes("--sps") || args.includes("--only-sps");
  const hasTablesFlag = args.some((a) => a.startsWith("--tables"));
  const hasSpsValueFlag = args.some((a) => a.startsWith("--sps="));
  const hasTablesValueFlag = args.some((a) => a.startsWith("--tables="));
  const hasAllSps = args.includes("--all-sps");
  const hasAllTables = args.includes("--all-tables");

  const runTables = hasAllTables || hasTablesFlag || hasTablesValueFlag;
  const runSps = hasAllSps || hasSpsValueFlag || isLegacy;

  if (!runTables && !runSps) {
    await seedAllStoredProcedures(prisma);
    await seedAllTables(prisma);
  } else {
    if (runSps) {
      if (isLegacy && !hasSpsValueFlag && !hasAllSps) {
        await seedAllStoredProcedures(prisma);
      } else if (hasSpsValueFlag) {
        const raw = args.find((a) => a.startsWith("--sps="))!.split("=")[1];
        await seedStoredProcedures(prisma, parseListArg(raw) as (keyof typeof SP_SEEDERS)[]);
      } else if (hasAllSps) {
        await seedAllStoredProcedures(prisma);
      }
    }

    if (runTables) {
      if (hasTablesValueFlag) {
        const raw = args.find((a) => a.startsWith("--tables="))!.split("=")[1];
        await seedTables(prisma, parseListArg(raw) as (keyof typeof TABLE_SEEDERS)[]);
      } else {
        await seedAllTables(prisma);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error en seed:", e);
  process.exit(1);
});
