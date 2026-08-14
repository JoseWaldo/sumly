import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().url(),
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  SES_FROM_EMAIL: z.string().email(),
  SES_FROM_NAME: z.string().min(1).default("Sumly"),
  ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY debe tener al menos 32 caracteres"),
  S3_BUCKET: z.string().min(1),
  S3_ENDPOINT: z.string().optional(),
});

export const env = envSchema.parse(process.env);
