import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .optional()
    .default(""),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`
  );
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL || "http://localhost:3000",
} as const;
