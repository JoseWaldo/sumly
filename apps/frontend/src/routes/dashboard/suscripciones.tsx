import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Plus, Repeat, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubscriptionCard } from "@/features/subscriptions/components/subscription-card";
import { SubscriptionCardSkeleton } from "@/features/subscriptions/components/subscription-card-skeleton";
import { SubscriptionDialog } from "@/features/subscriptions/components/subscription-dialog";
import { ReportPaymentDialog } from "@/features/subscriptions/components/report-payment-dialog";
import { PaymentMethodDetailModal } from "@/features/subscriptions/components/payment-method-detail-modal";
import {
  useSubscriptions,
  useTags,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  useReportPayment,
} from "@/features/subscriptions/hooks/use-subscriptions";
import type {
  Subscription,
  SubscriptionFormInput,
  SubscriptionFormaPago,
} from "@/features/subscriptions/schemas/subscription.schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/suscripciones")({
  component: SuscripcionesPage,
});

const STATUS_FILTERS = [
  { value: undefined, label: "Todas" },
  { value: "ACTIVE" as const, label: "Activas" },
  { value: "PAUSED" as const, label: "Pausadas" },
  { value: "CANCELLED" as const, label: "Canceladas" },
];

function SuscripcionesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "PAUSED" | "CANCELLED" | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [reportingSubscription, setReportingSubscription] = useState<Subscription | null>(null);
  const [detailFormaPago, setDetailFormaPago] = useState<SubscriptionFormaPago | null>(null);

  const { data, isLoading } = useSubscriptions({
    status: statusFilter,
    tagId: tagFilter,
    search: debouncedSearch || undefined,
    page: 1,
    limit: 50,
  });

  const { data: tags } = useTags();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();
  const reportPayment = useReportPayment();

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const handleCreate = async (data: SubscriptionFormInput) => {
    await createSubscription.mutateAsync({
      name: data.name,
      amount: data.amount,
      nextPaymentDate: data.nextPaymentDate,
      frequency: data.frequency,
      status: data.status,
      formaPagoId: data.formaPagoId,
      tagIds: data.tagIds,
    });
    setDialogOpen(false);
  };

  const handleUpdate = async (data: SubscriptionFormInput) => {
    if (!editingSubscription) return;
    await updateSubscription.mutateAsync({
      id: editingSubscription.id,
      data: {
        name: data.name,
        amount: data.amount,
        nextPaymentDate: data.nextPaymentDate,
        frequency: data.frequency,
        status: data.status,
        formaPagoId: data.formaPagoId,
        tagIds: data.tagIds,
      },
    });
    setEditingSubscription(null);
  };

  const handleDelete = async (id: string) => {
    await deleteSubscription.mutateAsync(id);
  };

  const handleReport = async (date: string) => {
    if (!reportingSubscription) return;
    await reportPayment.mutateAsync({ id: reportingSubscription.id, date });
    setReportingSubscription(null);
  };

  const openEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
  };

  const subscriptions = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Suscripciones</h2>
          <p className="text-muted-foreground">Gestiona tus suscripciones y registra sus pagos.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva suscripcion
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar suscripcion..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "inline-flex cursor-pointer items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border/30 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTagFilter(undefined)}
            className={cn(
              "inline-flex cursor-pointer items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
              !tagFilter
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border/30 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            Todos
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setTagFilter(tagFilter === tag.id ? undefined : tag.id)}
              className={cn(
                "inline-flex cursor-pointer items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all",
                tagFilter === tag.id ? "opacity-100" : "border-transparent opacity-50 hover:opacity-100"
              )}
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                borderColor: tagFilter === tag.id ? tag.color : "transparent",
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <SubscriptionCardSkeleton />
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Repeat className="mb-3 h-12 w-12 opacity-20" />
          <p className="text-sm">No tienes suscripciones registradas</p>
          <p className="mt-1 text-xs">
            Agrega tu primera suscripcion para empezar a gestionar tus pagos recurrentes.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva suscripcion
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={openEdit}
              onDelete={handleDelete}
              onReport={setReportingSubscription}
              onViewPaymentMethod={setDetailFormaPago}
            />
          ))}
        </div>
      )}

      <SubscriptionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        isLoading={createSubscription.isPending}
      />

      <SubscriptionDialog
        open={editingSubscription !== null}
        onClose={() => setEditingSubscription(null)}
        defaultValues={editingSubscription}
        onSubmit={handleUpdate}
        isLoading={updateSubscription.isPending}
      />

      <ReportPaymentDialog
        open={reportingSubscription !== null}
        onClose={() => setReportingSubscription(null)}
        subscription={reportingSubscription}
        onSubmit={handleReport}
        isLoading={reportPayment.isPending}
      />

      <PaymentMethodDetailModal
        open={detailFormaPago !== null}
        onClose={() => setDetailFormaPago(null)}
        formaPago={detailFormaPago}
      />
    </div>
  );
}
