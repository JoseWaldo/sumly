---
name: prisma-schema
description: Usa esta skill siempre que se trabaje con el schema de Prisma (prisma/schema/schema.prisma), se creen o corran migraciones, se defina o modifique un modelo/campo/enum, se configure prisma.config.ts, o se use PrismaClient dentro de un servicio. Aplica también cuando se cree una tabla, vista o stored procedure a mano vía SQL raw, o cuando se necesite decidir la convención de nombres (@@map, @map, prefijos tbl_/vw_/sp_). Actívala incluso si el usuario no menciona la palabra "Prisma" explícitamente, pero está tocando archivos bajo prisma/ o pidiendo agregar/cambiar campos de la base de datos.
---

# Prisma y Base de Datos - Backend

## Cuándo usar

Usa esta guía cuando trabajes con el schema de Prisma, crees migraciones, configures la conexión a base de datos, o uses el cliente de Prisma en servicios.

## Estructura de archivos

```
prisma/
└── schema/
    ├── schema.prisma      # Definición de modelos
    └── generated/         # Cliente generado (NO editar)

prisma.config.ts           # Configuración de datasource (Prisma 7+)
src/db/index.ts            # Singleton de PrismaClient
```

## Reglas fundamentales

### Imports del cliente

```typescript
// CORRECTO — @/prisma re-exporta todo desde prisma/schema/generated/client
import { PrismaClient } from "@/prisma";

// INCORRECTO - NO usar
import { PrismaClient } from "@prisma/client";
```

### Migraciones obligatorias

- **Nunca** usar `bunx prisma db push`. Siempre usar migraciones versionadas:

```bash
bunx prisma migrate dev --name nombre-descriptivo
```

- Para producción: `bunx prisma migrate deploy`.

### Regenerar cliente

Después de cualquier cambio al schema:

```bash
bun run generate
```

Esto ejecuta `prisma generate`, que regenera el cliente tipado en `prisma/schema/generated/`.

> Si tu proyecto además genera una API automática a partir del schema (código de terceros tipo codegen), revisá si existe una skill separada para esa herramienta antes de asumir que `bun run generate` hace algo más que esto.

## Convenciones de naming

En el schema de Prisma los modelos y campos se escriben en **PascalCase**/**camelCase** (idiomático de Prisma/TypeScript), pero todo lo que toca la base de datos física (tablas, columnas, stored procedures) se mapea a **snake_case** mediante `@@map` / `@map`. El schema nunca es la fuente de verdad del nombre físico: siempre revisa el `@@map` para saber cómo se llama el objeto en Postgres.

### Modelos

- **PascalCase** y **singular** en el schema: `User`, `Contract`, `Client`.
- Modelos de autenticación (`User`, `Account`, `Session`, `Role`) siempre en inglés por compatibilidad con Better Auth.
- Modelos de negocio: español o inglés, pero consistente dentro del proyecto.
- **Todo modelo nuevo debe declarar `@@map` con el nombre físico de la tabla en snake*case y prefijo `tbl*`** (ver [Mapeo a base de datos](#mapeo-a-base-de-datos-snake_case-y-prefijos)).

### Campos

| Tipo         | Convención en el schema (Prisma) | Convención en BD (`@map`)  | Ejemplo                                                 |
| ------------ | -------------------------------- | -------------------------- | ------------------------------------------------------- |
| ID primario  | `id` con `cuid()`                | `id`                       | `id String @id @default(cuid())`                        |
| Timestamps   | `createdAt`, `updatedAt`         | `created_at`, `updated_at` | `createdAt DateTime @default(now()) @map("created_at")` |
| Foreign keys | `nombreModeloId`                 | `nombre_modelo_id`         | `userId String @map("user_id")`                         |
| Booleanos    | Descriptivos                     | snake_case                 | `enabled`, `deleted`, `active`                          |
| Relaciones   | Nombre del modelo                | (no aplica, es virtual)    | `user User @relation(...)`                              |

Todo campo compuesto (más de una palabra) en el schema debe llevar su `@map("snake_case")` correspondiente; los campos de una sola palabra (`email`, `name`, `enabled`) no lo necesitan porque coinciden en ambas convenciones.

## Mapeo a base de datos (snake_case) y prefijos

Convención de nomenclatura física para todos los objetos de base de datos. Aplica a modelos nuevos y a cualquier objeto de BD creado a mano (migraciones raw SQL, stored procedures, vistas). Los modelos heredados de Better Auth (`user`, `session`, `account`, `role`, `casbin_rule`, sin prefijo) son una excepción histórica y **no se renombran**.

| Objeto           | Prefijo | snake_case | Ejemplo       |
| ---------------- | ------- | ---------- | ------------- |
| Base de datos    | `db_`   | sí         | `db_clientes` |
| Tabla            | `tbl_`  | sí         | `tbl_cliente` |
| Vista            | `vw_`   | sí         | `vw_cliente`  |
| Stored procedure | `sp_`   | sí         | `sp_cliente`  |

En el schema de Prisma, el modelo se define en PascalCase y el prefijo/snake_case se aplica en el `@@map`:

```prisma
model Cliente {
    id        String   @id @default(cuid())
    nombre    String
    createdAt DateTime @default(now()) @map("created_at")
    updatedAt DateTime @updatedAt @map("updated_at")

    @@map("tbl_cliente")
}
```

Reglas:

- El **nombre del modelo** (`Cliente`) es el que se usa en código TypeScript (`prisma.cliente.findMany()`), nunca el nombre físico.
- El **`@@map`** siempre en snake*case singular con prefijo `tbl*`: `tbl_cliente`, `tbl_contrato`, `tbl_usuario_rol`.
- Vistas (creadas vía migración raw SQL) siempre en snake*case con prefijo `vw*`: `vw_cliente_activo`. Si se modelan en Prisma como `model`/`view`de solo lectura, el`@@map` usa este mismo prefijo.
- Stored procedures y funciones de BD (creados vía migración raw SQL) siempre en snake*case con prefijo `sp*`: `sp_cliente_actualizar_saldo`.
- Si se referencia una base de datos completa (poco común, ej. en scripts de conexión o documentación de infraestructura), usar prefijo `db_`: `db_clientes`.

### Enums

Prefijo `Enum_` + PascalCase:

```prisma
enum Enum_RoleName {
    Super_Admin
    Admin
    Gerente_Comercial
}
```

## Campos obligatorios en todos los modelos

```prisma
model NombreModelo {
    id        String   @id @default(cuid())
    // ... campos del modelo
    createdAt DateTime @default(now()) @map("created_at")
    updatedAt DateTime @updatedAt @map("updated_at")

    @@map("tbl_nombre_modelo")
}
```

## Patrones recomendados

### Soft delete

Preferir soft delete sobre hard delete:

```prisma
model User {
    id      String  @id @default(cuid())
    deleted Boolean @default(false)
    enabled Boolean @default(true)
}
```

### Relaciones múltiples al mismo modelo

Usar nombres descriptivos con `@relation`:

```prisma
model Contrato {
    responsableComercial   User  @relation("ContratoResponsableComercial", ...)
    responsableComercialId String
    projectManager         User? @relation("ContratoProjectManager", ...)
    projectManagerId       String?
}
```

### Valores decimales

Para montos monetarios usar `Decimal`:

```prisma
salario Decimal @db.Decimal(18, 2)
```

### Campos únicos

```prisma
email String @unique
```

### Autoincrement para códigos visibles

```prisma
codigo Int @unique @default(autoincrement())
```

## Configuración del datasource (`prisma.config.ts`)

```typescript
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

## Uso en servicios

El cliente se inyecta automáticamente via middleware. Acceder desde el contexto del servicio:

```typescript
const myServiceCore: Service<Params, Response> = async (
  { prisma, user },
  params,
) => {
  const items = await prisma.item.findMany({
    where: { active: true },
    select: { id: true, name: true }, // Seleccionar solo campos necesarios
    orderBy: { createdAt: "desc" },
  });
  return items;
};
```

## Buenas prácticas de queries

- Usar `select` específico en vez de traer todos los campos.
- Implementar paginación en listados grandes.
- Optimizar queries N+1 con `include` estratégico.
- Crear índices para consultas frecuentes.

## Comandos principales

| Comando                                   | Propósito                                |
| ----------------------------------------- | ---------------------------------------- |
| `bun run generate`                        | Regenerar cliente Prisma                 |
| `bunx prisma migrate dev --name <nombre>` | Crear migración                          |
| `bunx prisma migrate deploy`              | Aplicar migraciones (producción)         |
| `bunx prisma studio`                      | Interfaz gráfica para inspeccionar datos |
| `bunx prisma validate`                    | Validar schema                           |
| `bunx prisma format`                      | Formatear schema                         |

## Verificación automática de convenciones

Antes de dar por cerrado un cambio de schema, corré el script de chequeo incluido en esta skill para detectar modelos o campos que rompen las convenciones de naming:

```bash
node scripts/check-naming.js prisma/schema/schema.prisma
```

Revisa: modelos sin `@@map`, `@@map` sin prefijo `tbl_`, campos compuestos sin `@map`, y enums sin prefijo `Enum_`. Ver `scripts/check-naming.js` para el detalle de cada regla.

## Errores comunes

- Importar de `@prisma/client` en vez de `@/prisma`.
- Usar `db push` en vez de `migrate dev`.
- Olvidar ejecutar `bun run generate` después de cambiar el schema.
- No agregar `createdAt` y `updatedAt` a modelos nuevos.
- Olvidar configurar `prisma.config.ts` (requerido en Prisma 7+).
- Editar archivos en `prisma/schema/generated/` (se pierden al regenerar).
- Omitir `@@map`/`@map` en modelos o campos nuevos, dejando el nombre físico en PascalCase/camelCase en vez de snake_case.
- Usar el nombre del modelo (`Cliente`) como si fuera el nombre físico de la tabla en SQL raw, migraciones o stored procedures, en vez de `tbl_cliente`.

## Cuándo preguntar al usuario

- Si un campo debe ser requerido u opcional.
- Si usar español o inglés para nombres de modelos de negocio.
- Si una relación debe ser cascade delete o restrict.
- Si se necesita un índice compuesto para performance.
- Si un modelo heredado (sin prefijo `tbl_`) debe migrarse a la nueva convención o mantenerse por compatibilidad.
