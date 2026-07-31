import { z } from "zod";

export const sendFriendshipRequestSchema = z.object({
  addresseeId: z.string().min(1, "El destinatario es requerido"),
});

export const blockUserSchema = z.object({
  userId: z.string().min(1, "El usuario es requerido"),
});

export type SendFriendshipRequestDTO = z.infer<typeof sendFriendshipRequestSchema>;
export type BlockUserDTO = z.infer<typeof blockUserSchema>;
