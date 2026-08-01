import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useDebts, useDebtDashboard, useDebtDetail, useDebtEventos, useCreateDeuda, useReportAbono, useConfirmAbono, useRejectAbono, useResolveDisputa, useCancelDeuda, useForgiveDeuda, useDeleteDeuda } from "@/features/debts/hooks/use-debts";
import { useFormasPago } from "@/features/formas-pago/hooks/use-formas-pago";
import { DebtCard, DebtCardSkeleton } from "@/features/debts/components/debt-card";
import { DebtFormDialog } from "@/features/debts/components/debt-form-dialog";
import { DebtDetailDialog } from "@/features/debts/components/debt-detail-dialog";
import { PayDebtDialog } from "@/features/debts/components/pay-debt-dialog";
import { DebtSummaryCards } from "@/features/debts/components/debt-summary-cards";
import { DeleteDebtDialog } from "@/features/debts/components/delete-debt-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { Plus, Search, SlidersHorizontal, FilterX } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import type { CreateDeudaInput, Debt, DebtEstado } from "@/features/debts/schemas/debt.schema";

export const Route = createFileRoute("/dashboard/deudas")({
  component: DeudasPage,
});

function DeudasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // UI state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [direccion, setDireccion] = useState<"ME_DEBEN" | "YO_DEBO" | undefined>("ME_DEBEN");
  const [estado, setEstado] = useState<DebtEstado | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>("desc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [payDebt, setPayDebt] = useState<Debt | null>(null);
  const [deleteDebt, setDeleteDebt] = useState<Debt | null>(null);

  // Queries
  const { data, isLoading } = useDebts({ direccion, estado, search, sortBy, sortDir, page, limit: 12 });
  const { data: dashboard } = useDebtDashboard();
  const { data: detail } = useDebtDetail(detailId);
  const { data: eventos } = useDebtEventos(detailId);
  const { data: formasPagoData } = useFormasPago({ page: 1, limit: 50 });

  // Mutations
  const crear = useCreateDeuda();
  const reportar = useReportAbono();
  const confirmar = useConfirmAbono();
  const rechazar = useRejectAbono();
  const resolverDisputa = useResolveDisputa();
  const cancelar = useCancelDeuda();
  const perdonar = useForgiveDeuda();
  const eliminar = useDeleteDeuda();

  const debts = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const formasPago = formasPagoData?.data ?? [];

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (estado) count++;
    if (sortBy) count++;
    return count;
  }, [estado, sortBy]);

  const clearFilters = () => {
    setEstado(undefined);
    setSortBy(undefined);
    setSortDir("desc");
    setPage(1);
  };

  // Handlers
  const handleCreate = async (data: CreateDeudaInput) => {
    await crear.mutateAsync(data);
    toast("Deuda creada", "success");
  };

  const handlePay = async (data: { monto: number; formaPagoId: string; comprobanteFileId?: string; idempotencyKey: string }) => {
    if (!payDebt) return;
    await reportar.mutateAsync({ deudaId: payDebt.id, data });
    toast("Pago reportado", "success");
    setPayDebt(null);
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: ["debts", "detail", detailId] });
      queryClient.invalidateQueries({ queryKey: ["debts", "eventos", detailId] });
    }
  };

  const handleConfirm = async (abonoId: string) => {
    if (!detailId) return;
    try {
      await confirmar.mutateAsync({ deudaId: detailId, abonoId });
      toast("Abono confirmado", "success");
      queryClient.invalidateQueries({ queryKey: ["debts", "detail", detailId] });
      queryClient.invalidateQueries({ queryKey: ["debts", "eventos", detailId] });
    } catch (e: any) {
      toast(e?.message ?? "Error", "error");
    }
  };

  const handleReject = async (abonoId: string) => {
    if (!detailId) return;
    try {
      await rechazar.mutateAsync({ deudaId: detailId, abonoId });
      toast("Abono rechazado", "success");
      queryClient.invalidateQueries({ queryKey: ["debts", "detail", detailId] });
      queryClient.invalidateQueries({ queryKey: ["debts", "eventos", detailId] });
    } catch (e: any) {
      toast(e?.message ?? "Error", "error");
    }
  };

  const handleCancel = async () => {
    if (!detailId) return;
    try {
      await cancelar.mutateAsync(detailId);
      toast("Deuda cancelada", "success");
      setDetailId(null);
    } catch (e: any) {
      toast(e?.message ?? "Error", "error");
    }
  };

  const handleForgive = async () => {
    if (!detailId) return;
    try {
      await perdonar.mutateAsync(detailId);
      toast("Deuda perdonada", "success");
      setDetailId(null);
    } catch (e: any) {
      toast(e?.message ?? "Error", "error");
    }
  };

  const handleResolve = async (accion: "regresar_pendiente" | "forzar_pagada") => {
    if (!detailId) return;
    try {
      await resolverDisputa.mutateAsync({ deudaId: detailId, accion });
      toast("Disputa resuelta", "success");
      queryClient.invalidateQueries({ queryKey: ["debts", "detail", detailId] });
    } catch (e: any) {
      toast(e?.message ?? "Error", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteDebt) return;
    try {
      await eliminar.mutateAsync(deleteDebt.id);
      toast("Deuda eliminada", "success");
      setDeleteDebt(null);
    } catch (e: any) {
      toast(e?.message ?? "Error", "error");
    }
  };

  const detailAbonos = (detail as any)?.abonos ?? [];
  const detailEventos = eventos ?? [];
  const isAcreedor = detail ? detail.acreedorUserId === user?.id : false;
  const isDeudor = detail ? detail.deudorUserId === user?.id : false;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Deudas</h1>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Nueva deuda
        </Button>
      </div>

      {/* Summary */}
      <DebtSummaryCards
        aFavor={dashboard?.aFavor ?? 0}
        enContra={dashboard?.enContra ?? 0}
        isLoading={!dashboard}
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30">
        {(["ME_DEBEN", "YO_DEBO"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setDireccion(tab); setPage(1); }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              direccion === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "ME_DEBEN" ? "Me deben" : "Yo debo"}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setSheetOpen(true)} className="relative shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 shrink-0 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <FilterX className="h-3.5 w-3.5" /> Limpiar
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <DebtCardSkeleton key={i} />
              ))}
            </div>
          ) : debts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No hay deudas registradas</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Crear primera deuda
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {debts.map((d) => (
                <DebtCard
                  key={d.id}
                  debt={d}
                  direction={direccion === "ME_DEBEN" ? "Me deben" : "Yo debo"}
                  onSelect={() => setDetailId(d.id)}
                  onPay={() => setPayDebt(d)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FilterSheet */}
      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <FilterSheet.Header onClose={() => setSheetOpen(false)} />
        <FilterSheet.Body>
          <FilterSheet.Section label="Estado">
            <div className="flex flex-wrap gap-1.5">
              {[
                { v: undefined, l: "Todos" },
                { v: "PENDIENTE", l: "Pendiente" },
                { v: "ESPERANDO_CONFIRMACION", l: "Esperando" },
                { v: "PAGADA", l: "Pagada" },
                { v: "DISPUTADA", l: "Disputada" },
                { v: "VENCIDA", l: "Vencida" },
                { v: "CANCELADA", l: "Cancelada" },
              ].map((opt) => (
                <button
                  key={opt.l}
                  type="button"
                  onClick={() => { setEstado(opt.v as DebtEstado | undefined); setPage(1); }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    estado === opt.v || (!estado && !opt.v)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </FilterSheet.Section>

          <FilterSheet.Section label="Ordenar por">
            <div className="space-y-1">
              {[
                { v: "created_at", l: "Fecha creacion" },
                { v: "monto", l: "Monto" },
                { v: "saldo_pendiente", l: "Saldo pendiente" },
                { v: "fecha_vencimiento", l: "Vencimiento" },
                { v: "contraparte", l: "Persona" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setSortBy(opt.v)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                    sortBy === opt.v ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              <button
                type="button"
                onClick={() => setSortDir("asc")}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  sortDir === "asc" ? "border-primary bg-primary/10 text-primary" : "border-input/40 text-muted-foreground hover:border-input"
                }`}
              >
                Mas antiguo
              </button>
              <button
                type="button"
                onClick={() => setSortDir("desc")}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  sortDir === "desc" || !sortDir ? "border-primary bg-primary/10 text-primary" : "border-input/40 text-muted-foreground hover:border-input"
                }`}
              >
                Mas reciente
              </button>
            </div>
          </FilterSheet.Section>
        </FilterSheet.Body>
        <FilterSheet.Footer>
          <button onClick={clearFilters} className="flex-1 rounded-lg border border-border/30 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer">
            Limpiar filtros
          </button>
          <button onClick={() => setSheetOpen(false)} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer">
            Aplicar
          </button>
        </FilterSheet.Footer>
      </FilterSheet>

      {/* Dialogs */}
      <DebtFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} isLoading={crear.isPending} />

      <DebtDetailDialog
        open={!!detailId}
        onClose={() => setDetailId(null)}
        debt={detail ?? null}
        abonos={detailAbonos}
        eventos={detailEventos}
        isAcreedor={isAcreedor}
        isDeudor={isDeudor}
        onPay={() => detail && setPayDebt(detail)}
        onConfirm={handleConfirm}
        onReject={handleReject}
        onCancel={handleCancel}
        onForgive={handleForgive}
        onResolveDisputa={handleResolve}
        isLoading={confirmar.isPending || rechazar.isPending || cancelar.isPending || perdonar.isPending}
      />

      <PayDebtDialog
        open={!!payDebt}
        onClose={() => setPayDebt(null)}
        debt={payDebt}
        formasPago={formasPago}
        onSubmit={handlePay}
        isLoading={reportar.isPending}
      />

      <DeleteDebtDialog
        open={!!deleteDebt}
        onClose={() => setDeleteDebt(null)}
        onConfirm={handleDelete}
        isLoading={eliminar.isPending}
        debt={deleteDebt}
      />
    </div>
  );
}
