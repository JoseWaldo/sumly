import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
