import "dotenv/config";
import { prisma } from "@/db";

const ENTIDADES = [
  { nombre: "Bancolombia", gradienteInicio: "#FFD100", gradienteFin: "#FCA311", formatoNumero: "XXX-XXXX-XXX" },
  { nombre: "Nu", gradienteInicio: "#7B2FBE", gradienteFin: "#4A1D8A", formatoNumero: "XXX-XXXX-XXX" },
  { nombre: "Nequi", gradienteInicio: "#E91E63", gradienteFin: "#AD1457", formatoNumero: "XXX-XXX-XXXX" },
  { nombre: "DaviPlata", gradienteInicio: "#FF0000", gradienteFin: "#CC0000", formatoNumero: "XXX-XXX-XXXX" },
  { nombre: "Bre-B", gradienteInicio: "#1A73E8", gradienteFin: "#0D47A1", formatoNumero: null },
];

async function main() {
  console.log("Iniciando seed de entidades financieras...");

  for (const entidad of ENTIDADES) {
    const existing = await prisma.entidadFinanciera.findFirst({
      where: { nombre: entidad.nombre, userId: null },
    });

    if (existing) {
      console.log(`Entidad "${entidad.nombre}" ya existe, omitiendo...`);
      continue;
    }

    await prisma.entidadFinanciera.create({
      data: { ...entidad, esSistema: true },
    });

    console.log(`Entidad "${entidad.nombre}" creada.`);
  }

  console.log("Seed completado.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error en seed:", e);
  process.exit(1);
});
