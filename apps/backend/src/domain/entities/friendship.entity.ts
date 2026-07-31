import type { BaseEntity } from "@/domain/entities/base.entity";

export interface FriendshipEntity extends BaseEntity {
  requesterId: string;
  addresseeId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  previousStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED" | null;
  blockedById: string | null;
  respondedAt: Date | null;
  otherUser?: {
    id: string;
    name: string;
    image: string | null;
    email: string | null;
  };
}
