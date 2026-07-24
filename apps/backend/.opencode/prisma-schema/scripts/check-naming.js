#!/usr/bin/env node
/**
 * check-naming.js
 *
 * Chequeo rápido de convenciones de naming para schema.prisma:
 *   - Todo `model` debe tener `@@map("tbl_...")`
 *   - Todo `enum` debe llamarse `Enum_<PascalCase>`
 *   - Todo campo compuesto (más de una palabra en camelCase) debe tener `@map("snake_case")`
 *
 * Uso:
 *   node scripts/check-naming.js prisma/schema/schema.prisma
 *
 * Exit code 0 si no hay problemas, 1 si encuentra alguno (útil para CI).
 */

const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];

if (!filePath) {
  console.error("Uso: node scripts/check-naming.js <ruta-al-schema.prisma>");
  process.exit(2);
}

const absPath = path.resolve(filePath);
if (!fs.existsSync(absPath)) {
  console.error(`No se encontró el archivo: ${absPath}`);
  process.exit(2);
}

const content = fs.readFileSync(absPath, "utf8");

// Modelos heredados de Better Auth: excepción histórica, no requieren prefijo tbl_
const LEGACY_MODELS = new Set([
  "user",
  "session",
  "account",
  "role",
  "casbin_rule",
]);

const issues = [];

// --- Extraer bloques de "model X { ... }" ---
const modelRegex = /model\s+(\w+)\s*\{([^}]*)\}/gs;
let match;

while ((match = modelRegex.exec(content)) !== null) {
  const [, modelName, body] = match;

  const mapMatch = body.match(/@@map\("([^"]+)"\)/);

  if (!mapMatch) {
    issues.push(
      `Modelo "${modelName}": falta @@map(...). Todo modelo nuevo debe declarar su nombre físico de tabla.`,
    );
  } else {
    const physicalName = mapMatch[1];
    const isLegacy = LEGACY_MODELS.has(physicalName);
    if (!isLegacy && !physicalName.startsWith("tbl_")) {
      issues.push(
        `Modelo "${modelName}": @@map("${physicalName}") no tiene el prefijo "tbl_" esperado.`,
      );
    }
  }

  // --- Chequear campos compuestos sin @map ---
  const fieldLines = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of fieldLines) {
    // Ignorar líneas de directivas de bloque (@@...) y comentarios
    if (line.startsWith("@@") || line.startsWith("//")) continue;

    const fieldMatch = line.match(/^(\w+)\s+/);
    if (!fieldMatch) continue;

    const fieldName = fieldMatch[1];
    const isComposite = /[a-z][A-Z]/.test(fieldName); // heurística: camelCase = más de una palabra
    const hasMap = /@map\("/.test(line);

    if (isComposite && !hasMap) {
      issues.push(
        `Modelo "${modelName}", campo "${fieldName}": es compuesto (camelCase) pero no tiene @map("snake_case").`,
      );
    }
  }
}

// --- Extraer enums y chequear prefijo Enum_ ---
const enumRegex = /enum\s+(\w+)\s*\{/g;
while ((match = enumRegex.exec(content)) !== null) {
  const [, enumName] = match;
  if (!enumName.startsWith("Enum_")) {
    issues.push(
      `Enum "${enumName}": no tiene el prefijo "Enum_" esperado (ej. Enum_RoleName).`,
    );
  }
}

// --- Reporte ---
if (issues.length === 0) {
  console.log("✅ Sin problemas de naming detectados.");
  process.exit(0);
} else {
  console.log(`⚠️  ${issues.length} problema(s) de naming encontrados:\n`);
  issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
  process.exit(1);
}
