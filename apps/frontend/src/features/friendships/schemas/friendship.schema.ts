import { z } from "zod";

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  blockedById: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  otherUser?: {
    id: string;
    name: string;
    image: string | null;
    email: string | null;
  };
}

export interface PaginatedFriendships {
  data: Friendship[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchUserResult {
  id: string;
  name: string;
  image: string | null;
  email: string;
  existingFriendship: {
    id: string;
    status: string;
    direction: "sent" | "received" | null;
  } | null;
}

export const sendRequestSchema = z.object({
  addresseeId: z.string().min(1),
});

export const blockUserSchema = z.object({
  userId: z.string().min(1),
});

export type SendFriendshipRequestInput = z.infer<typeof sendRequestSchema>;
