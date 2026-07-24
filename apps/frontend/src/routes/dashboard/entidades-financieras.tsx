import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function EntidadesFinancierasPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntidad, setEditingEntidad] = useState<EntidadFinanciera | null>(null);
  const [deletingEntidad, setDeletingEntidad] = useState<EntidadFinanciera | null>(null);

  const { data: paginated, isLoading } = useEntidadesFinancieras(search || undefined);

  const createMutation = useCreateEntidadFinanciera();
  const updateMutation = useUpdateEntidadFinanciera();
  const deleteMutation = useDeleteEntidadFinanciera();

  const entidades = paginated?.data ?? [];
  const total = paginated?.total ?? 0;
  const totalPages = paginated?.totalPages ?? 1;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total} entidade{total !== 1 ? "s" : ""}
        </p>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar entidad..."
            className="pl-9 pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {total} entidade{total !== 1 ? "s" : ""}
          </CardTitle>
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
    </div>
  );
}
