import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, FilterX, ArrowUpDown, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import { TransactionsTableSkeleton } from "@/features/transactions/components/transactions-table-skeleton";
import { DeleteTransactionDialog } from "@/features/transactions/components/delete-transaction-dialog";
import { Dialog } from "@/features/categories/components/category-dialog";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { useFormasPago } from "@/features/formas-pago/hooks/use-formas-pago";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/features/transactions/hooks/use-transactions";
import type {
  Transaction,
  TransactionFormInput,
} from "@/features/transactions/schemas/transaction.schema";

export const Route = createFileRoute("/dashboard/historial")({
  component: HistorialPage,
});

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getWeekRange(offset: number): { from: string; to: string } {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  d.setDate(diff);
  const monday = d.toISOString().split("T")[0];
  d.setDate(d.getDate() + 6);
  const sunday = d.toISOString().split("T")[0];
  return { from: monday, to: sunday };
}

function HistorialPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [formaPagoId, setFormaPagoId] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [datePreset, setDatePreset] = useState<string>("month");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  const { data: formasPagoData } = useFormasPago({ page: 1, limit: 100 });

  const sortOptions: { value: string; label: string }[] = useMemo(() => [
    { value: "date", label: "Fecha" },
    { value: "amount", label: "Monto" },
    { value: "category", label: "Categoria" },
    { value: "forma_pago", label: "Forma de pago" },
  ], []);

  const typeParam = typeFilter === "ALL" ? undefined : typeFilter;

  const { data, isLoading } = useTransactions({
    type: typeParam,
    search: search || undefined,
    month: datePreset === "month" ? month : undefined,
    year: datePreset === "month" ? year : undefined,
    dateFrom: datePreset === "range" ? (dateFrom || undefined) : undefined,
    dateTo: datePreset === "range" ? (dateTo || undefined) : (datePreset === "week" ? dateTo || undefined : undefined),
    formaPagoId: formaPagoId || undefined,
    sortBy,
    sortDir,
    page,
    limit: 15,
  });

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (formData: TransactionFormInput) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, data: formData });
      toast("Movimiento actualizado");
    } else {
      await createMutation.mutateAsync(formData);
      toast("Movimiento creado");
    }
    handleCloseDialog();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    await deleteMutation.mutateAsync(deletingTransaction.id);
    toast("Movimiento eliminado");
    setDeletingTransaction(null);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setFormaPagoId("");
    setDatePreset("month");
    setDateFrom("");
    setDateTo("");
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setSortBy("date");
    setSortDir("desc");
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== "ALL") count++;
    if (formaPagoId) count++;
    if (datePreset === "week") count++;
    if (datePreset === "range") count++;
    if (datePreset === "month" && (month !== new Date().getMonth() + 1 || year !== new Date().getFullYear())) count++;
    if (sortBy !== "date" || sortDir !== "desc") count++;
    return count;
  }, [typeFilter, formaPagoId, datePreset, month, year, sortBy, sortDir]);

  const transactions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Historial de movimientos</h2>
          <p className="text-muted-foreground">Todos tus ingresos y gastos</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo movimiento</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripcion..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
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
                <FilterX className="h-3.5 w-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TransactionsTableSkeleton />
          ) : (
            <TransactionsTable
              transactions={transactions}
              page={page}
              totalPages={totalPages}
              total={total}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              onPageChange={setPage}
              onEdit={handleOpenEdit}
              onDelete={setDeletingTransaction}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={editingTransaction ? "Editar movimiento" : "Nuevo movimiento"}
      >
        <TransactionForm
          defaultValues={editingTransaction}
          defaultType={typeParam ?? "EXPENSE"}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Dialog>

      <DeleteTransactionDialog
        open={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <FilterSheet.Header onClose={() => setSheetOpen(false)} />
        <FilterSheet.Body>
          <FilterSheet.Section label="Tipo de movimiento">
            <div className="flex gap-1.5">
              {(["ALL", "INCOME", "EXPENSE"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTypeFilter(t);
                    setPage(1);
                  }}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    typeFilter === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  )}
                >
                  {t === "ALL" ? "Todos" : t === "INCOME" ? "Ingresos" : "Gastos"}
                </button>
              ))}
            </div>
          </FilterSheet.Section>

          <FilterSheet.Section label="Periodo">
            <div className="flex gap-1.5">
              {(["month", "week", "range"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setDatePreset(preset);
                    setPage(1);
                    if (preset === "week") {
                      const { from, to } = getWeekRange(0);
                      setDateFrom(from);
                      setDateTo(to);
                    }
                  }}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    datePreset === preset
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  )}
                >
                  {preset === "month" ? "Mes" : preset === "week" ? "Semana" : "Rango"}
                </button>
              ))}
            </div>

            <div className="pt-1">
              {datePreset === "month" && (
                <div className="flex gap-2">
                  <Select
                    value={month}
                    onChange={(e) => {
                      setMonth(Number(e.target.value));
                      setPage(1);
                    }}
                    className="flex-1"
                  >
                    {MONTHS.map((name, i) => (
                      <option key={i} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={year}
                    onChange={(e) => {
                      setYear(Number(e.target.value));
                      setPage(1);
                    }}
                    className="w-24"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                      (y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      )
                    )}
                  </Select>
                </div>
              )}

              {datePreset === "range" && (
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </FilterSheet.Section>

          <FilterSheet.Section label="Forma de pago">
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b from-card to-transparent" />
              <div
                className="space-y-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin"
              >
                <button
                  type="button"
                  onClick={() => {
                    setFormaPagoId("");
                    setPage(1);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                    formaPagoId === ""
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <div className="h-2.5 w-2.5 rounded-full border-2 border-muted-foreground/40" />
                  Todas las formas de pago
                </button>
                {(formasPagoData?.data ?? []).map((fp) => (
                  <button
                    key={fp.id}
                    type="button"
                    onClick={() => {
                      setFormaPagoId(fp.id);
                      setPage(1);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                      formaPagoId === fp.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${fp.gradienteInicio}, ${fp.gradienteFin})`,
                      }}
                    />
                    <span className="truncate">{fp.nombre}</span>
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-4 bg-gradient-to-b from-transparent to-card" />
            </div>
          </FilterSheet.Section>

          <FilterSheet.Section label="Ordenar por">
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSort(opt.value)}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      sortBy === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSortDir("desc")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5",
                    sortDir === "desc"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  )}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Mas reciente
                </button>
                <button
                  type="button"
                  onClick={() => setSortDir("asc")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5",
                    sortDir === "asc"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  )}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Mas antiguo
                </button>
              </div>
            </div>
          </FilterSheet.Section>
        </FilterSheet.Body>
        <FilterSheet.Footer>
          <button
            type="button"
            onClick={clearFilters}
            className="flex-1 rounded-lg border border-border/30 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
          >
            Aplicar
          </button>
        </FilterSheet.Footer>
      </FilterSheet>
    </div>
  );
}

