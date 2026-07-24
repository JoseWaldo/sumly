import type { SubscriptionEntity, SubscriptionTagEntity, SubscriptionStatus } from "@/domain/entities/subscription.entity";
import type { PaginatedResult } from "@/shared/types";

export interface FindSubscriptionsFilters {
  userId: string;
  status?: SubscriptionStatus;
  tagId?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateSubscriptionInput {
  name: string;
  amount: number;
  nextPaymentDate: Date;
  frequency: string;
  status: string;
  formaPagoId: string;
  tagIds: string[];
  userId: string;
}

export interface UpdateSubscriptionInput {
  name?: string;
  amount?: number;
  nextPaymentDate?: Date;
  frequency?: string;
  status?: string;
  formaPagoId?: string;
  tagIds?: string[];
}

export interface CreateTagInput {
  name: string;
  color: string;
  userId: string;
}

export interface SubscriptionDashboardSummary {
  monthlyTotal: number;
  activeCount: number;
  upcomingPayments: SubscriptionEntity[];
}

export interface ISubscriptionRepository {
  findAllByUser(filters: FindSubscriptionsFilters): Promise<PaginatedResult<SubscriptionEntity>>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  create(data: CreateSubscriptionInput): Promise<SubscriptionEntity>;
  update(id: string, data: UpdateSubscriptionInput): Promise<SubscriptionEntity>;
  delete(id: string): Promise<void>;
  getDashboardSummary(userId: string): Promise<SubscriptionDashboardSummary>;
  findTagsByUser(userId: string): Promise<SubscriptionTagEntity[]>;
  createTag(data: CreateTagInput): Promise<SubscriptionTagEntity>;
  deleteTag(id: string, userId: string): Promise<void>;
}
