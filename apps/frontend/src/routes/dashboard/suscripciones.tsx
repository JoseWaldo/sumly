import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useMemo } from "react";
import { Plus, Repeat, Search, SlidersHorizontal, FilterX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { SubscriptionCard } from "@/features/subscriptions/components/subscription-card";
import { SubscriptionCardSkeleton } from "@/features/subscriptions/components/subscription-card-skeleton";
import { SubscriptionDialog } from "@/features/subscriptions/components/subscription-dialog";
import { ReportPaymentDialog } from "@/features/subscriptions/components/report-payment-dialog";
import { PaymentMethodDetailModal } from "@/features/subscriptions/components/payment-method-detail-modal";
import { DeleteSubscriptionDialog } from "@/features/subscriptions/components/delete-subscription-dialog";
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

const SORT_OPTIONS = [
  { value: "nextPaymentDate", label: "Fecha pago" },
  { value: "name", label: "Nombre" },
  { value: "amount", label: "Monto" },
  { value: "status", label: "Estado" },
];

function SuscripcionesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "PAUSED" | "CANCELLED" | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState("nextPaymentDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [reportingSubscription, setReportingSubscription] = useState<Subscription | null>(null);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [detailFormaPago, setDetailFormaPago] = useState<SubscriptionFormaPago | null>(null);

  const { data, isLoading } = useSubscriptions({
    status: statusFilter,
    tagId: tagFilter,
    search: debouncedSearch || undefined,
    page: 1,
    limit: 50,
    sortBy,
    sortDir,
  });

  const { data: tags } = useTags();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();
  const reportPayment = useReportPayment();
  const { toast } = useToast();

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== undefined) count++;
    if (tagFilter !== undefined) count++;
    if (sortBy !== "nextPaymentDate" || sortDir !== "asc") count++;
    return count;
  }, [statusFilter, tagFilter, sortBy, sortDir]);

  const handleClearFilters = () => {
    setStatusFilter(undefined);
    setTagFilter(undefined);
    setSortBy("nextPaymentDate");
    setSortDir("asc");
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
    toast("Suscripción creada");
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
    toast("Suscripción actualizada");
    setEditingSubscription(null);
  };

  const handleDelete = async (id: string) => {
    await deleteSubscription.mutateAsync(id);
    toast("Suscripción eliminada");
    setDeletingSubscription(null);
  };

  const handleReport = async (date: string) => {
    if (!reportingSubscription) return;
    await reportPayment.mutateAsync({ id: reportingSubscription.id, date });
    toast("Pago registrado");
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
          <h2 className="text-2xl font-semibold tracking-tight">Suscripciones</h2>
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
            placeholder="Buscar suscripción..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSheetOpen(true)}
          className="relative shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="icon" onClick={handleClearFilters} className="shrink-0">
            <FilterX className="h-4 w-4" />
          </Button>
        )}
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
            Agrega tu primera suscripción para empezar a gestionar tus pagos recurrentes.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nueva suscripción
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={openEdit}
              onDelete={(id) => {
                const sub = subscriptions.find((s) => s.id === id) ?? null;
                setDeletingSubscription(sub);
              }}
              onReport={setReportingSubscription}
              onViewPaymentMethod={setDetailFormaPago}
            />
          ))}
        </div>
      )}

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <FilterSheet.Header onClose={() => setSheetOpen(false)} />
        <FilterSheet.Body>
          <FilterSheet.Section label="Estado">
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
          </FilterSheet.Section>

          {tags && tags.length > 0 && (
            <FilterSheet.Section label="Tags">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTagFilter(undefined)}
                  className={cn(
                    "inline-flex cursor-pointer items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
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
                      "inline-flex cursor-pointer items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      tagFilter === tag.id
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border/30 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    style={{
                      backgroundColor: tagFilter === tag.id ? `${tag.color}20` : undefined,
                      color: tagFilter === tag.id ? tag.color : undefined,
                      borderColor: tagFilter === tag.id ? tag.color : undefined,
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </FilterSheet.Section>
          )}

          <FilterSheet.Section label="Ordenar por">
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSortBy(opt.value)}
                  className={cn(
                    "inline-flex cursor-pointer items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    sortBy === opt.value
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border/30 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              className="mt-2 inline-flex cursor-pointer items-center rounded-md border border-border/30 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {sortDir === "asc" ? "Ascendente" : "Descendente"}
            </button>
          </FilterSheet.Section>
        </FilterSheet.Body>
        <FilterSheet.Footer>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              handleClearFilters();
              setSheetOpen(false);
            }}
          >
            Limpiar filtros
          </Button>
          <Button className="flex-1" onClick={() => setSheetOpen(false)}>
            Aplicar
          </Button>
        </FilterSheet.Footer>
      </FilterSheet>

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

      <DeleteSubscriptionDialog
        open={deletingSubscription !== null}
        onClose={() => setDeletingSubscription(null)}
        onConfirm={() => {
          if (deletingSubscription) handleDelete(deletingSubscription.id);
        }}
        isLoading={deleteSubscription.isPending}
        subscriptionName={deletingSubscription?.name}
        subscriptionAmount={deletingSubscription ? `$${deletingSubscription.amount.toLocaleString("es-CO")} / mes` : undefined}
      />
    </div>
  );
}
