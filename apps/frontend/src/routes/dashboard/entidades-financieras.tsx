import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, FilterX, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { EntidadesFinancierasTable } from "@/features/formas-pago/components/entidades-financieras-table";
import { EntidadesFinancierasTableSkeleton } from "@/features/formas-pago/components/entidades-financieras-table-skeleton";
import { EntidadFinancieraForm } from "@/features/formas-pago/components/entidad-financiera-form";
import { DeleteEntidadDialog } from "@/features/formas-pago/components/delete-entidad-dialog";
import { FormaPagoDialog } from "@/features/formas-pago/components/forma-pago-dialog";
import {
  useEntidadesFinancieras,
  useCreateEntidadFinanciera,
  useUpdateEntidadFinanciera,
  useDeleteEntidadFinanciera,
} from "@/features/formas-pago/hooks/use-entidades-financieras";
import type { EntidadFinanciera } from "@/features/formas-pago/schemas/forma-pago.schema";

export const Route = createFileRoute("/dashboard/entidades-financieras")({
  component: EntidadesFinancierasPage,
});

const sortOptions: { value: string; label: string }[] = [
  { value: "nombre", label: "Nombre" },
  { value: "sistema", label: "Sistema" },
];

function EntidadesFinancierasPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("nombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntidad, setEditingEntidad] = useState<EntidadFinanciera | null>(null);
  const [deletingEntidad, setDeletingEntidad] = useState<EntidadFinanciera | null>(null);

  const { data: paginated, isLoading } = useEntidadesFinancieras({
    search: search || undefined,
    sortBy,
    sortDir,
  });

  const createMutation = useCreateEntidadFinanciera();
  const updateMutation = useUpdateEntidadFinanciera();
  const deleteMutation = useDeleteEntidadFinanciera();

  const entidades = paginated?.data ?? [];
  const total = paginated?.total ?? 0;
  const totalPages = paginated?.totalPages ?? 1;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("nombre");
    setSortDir("asc");
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sortBy !== "nombre" || sortDir !== "asc") count++;
    return count;
  }, [sortBy, sortDir]);

  function openCreate() {
    setEditingEntidad(null);
    setFormOpen(true);
  }

  function openEdit(entidad: EntidadFinanciera) {
    setEditingEntidad(entidad);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingEntidad(null);
  }

  async function handleCreate(data: { nombre: string; gradienteInicio: string; gradienteFin: string; formatoNumero?: string | null }) {
    await createMutation.mutateAsync(data);
    closeForm();
  }

  async function handleUpdate(data: { nombre: string; gradienteInicio: string; gradienteFin: string; formatoNumero?: string | null }) {
    if (!editingEntidad) return;
    await updateMutation.mutateAsync({ id: editingEntidad.id, data });
    closeForm();
  }

  async function handleDelete() {
    if (!deletingEntidad) return;
    await deleteMutation.mutateAsync(deletingEntidad.id);
    setDeletingEntidad(null);
    if (entidades.length === 1 && page > 1) {
      setPage(page - 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-normal tracking-tight">Entidades financieras</h2>
          <p className="text-muted-foreground">Gestiona el catalogo de bancos y billeteras digitales.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva entidad
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar entidad..."
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
        <CardContent className="p-0">
          {isLoading ? (
            <EntidadesFinancierasTableSkeleton />
          ) : (
            <EntidadesFinancierasTable
              entidades={entidades}
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              onEdit={openEdit}
              onDelete={(e) => setDeletingEntidad(e)}
            />
          )}
        </CardContent>
      </Card>

      <FormaPagoDialog
        open={formOpen}
        onClose={closeForm}
        title={editingEntidad ? "Editar entidad financiera" : "Nueva entidad financiera"}
      >
        <EntidadFinancieraForm
          defaultValues={editingEntidad}
          onSubmit={editingEntidad ? handleUpdate : handleCreate}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </FormaPagoDialog>

      <DeleteEntidadDialog
        open={!!deletingEntidad}
        onClose={() => setDeletingEntidad(null)}
        onConfirm={handleDelete}
        entidadName={deletingEntidad?.nombre ?? ""}
        isLoading={deleteMutation.isPending}
      />

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <FilterSheet.Header onClose={() => setSheetOpen(false)} />
        <FilterSheet.Body>
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
                  onClick={() => setSortDir("asc")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5",
                    sortDir === "asc"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  )}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  A - Z
                </button>
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
                  Z - A
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
