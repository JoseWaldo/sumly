import type { PrismaClient } from "../../../prisma/schema/generated";

const expenseCategories = [
  { name: "Alimentacion", icon: "utensils" },
  { name: "Transporte", icon: "car" },
  { name: "Vivienda", icon: "home" },
  { name: "Salud", icon: "heart-pulse" },
  { name: "Ocio", icon: "gamepad-2" },
  { name: "Educacion", icon: "graduation-cap" },
  { name: "Ropa", icon: "shirt" },
  { name: "Tecnologia", icon: "laptop" },
  { name: "Servicios", icon: "wrench" },
  { name: "Mascotas", icon: "paw-print" },
  { name: "Regalos", icon: "gift" },
  { name: "Suscripciones", icon: "repeat" },
  { name: "Impuestos", icon: "landmark" },
  { name: "Seguros", icon: "shield" },
  { name: "Otros Gastos", icon: "ellipsis" },
] as const;

const incomeCategories = [
  { name: "Salario", icon: "briefcase" },
  { name: "Freelance", icon: "pen-line" },
  { name: "Inversiones", icon: "trending-up" },
  { name: "Negocio", icon: "store" },
  { name: "Alquiler", icon: "building-2" },
  { name: "Reembolsos", icon: "undo-2" },
  { name: "Otros Ingresos", icon: "ellipsis" },
] as const;

export async function seedTblCategory(prisma: PrismaClient) {
  console.log("Iniciando seed de categorias del sistema...");

  const allCategories = [
    ...expenseCategories.map((c) => ({ ...c, type: "EXPENSE" as const })),
    ...incomeCategories.map((c) => ({ ...c, type: "INCOME" as const })),
  ];

  for (const cat of allCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { icon: cat.icon },
      });
    } else {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          userId: null,
        },
      });
    }
  }

  console.log("Seed de categorias del sistema completado.");
}
