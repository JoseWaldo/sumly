import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormaPagoCard } from "@/features/formas-pago/components/forma-pago-card";
import { FormaPagoCardSkeleton } from "@/features/formas-pago/components/forma-pago-card-skeleton";
import { FormaPagoForm } from "@/features/formas-pago/components/forma-pago-form";
import { FormaPagoDialog } from "@/features/formas-pago/components/forma-pago-dialog";
import { DeleteFormaPagoDialog } from "@/features/formas-pago/components/delete-forma-pago-dialog";
import {
  useFormasPago,
  useCreateFormaPago,
  useUpdateFormaPago,
  useDeleteFormaPago,
} from "@/features/formas-pago/hooks/use-formas-pago";
import type { FormaPago, FormaPagoFormInput } from "@/features/formas-pago/schemas/forma-pago.schema";

export const Route = createFileRoute("/dashboard/formas-de-pago")({
  component: FormasPagoPage,
});

const PAGE_SIZE = 24;

function FormasPagoPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingFormaPago, setEditingFormaPago] = useState<FormaPago | null>(null);
  const [deletingFormaPago, setDeletingFormaPago] = useState<FormaPago | null>(null);

  const { data: paginated, isLoading } = useFormasPago({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const createMutation = useCreateFormaPago();
  const updateMutation = useUpdateFormaPago();
  const deleteMutation = useDeleteFormaPago();

  const formasPago = paginated?.data ?? [];
  const total = paginated?.total ?? 0;
  const totalPages = paginated?.totalPages ?? 1;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  function openCreate() {
    setEditingFormaPago(null);
    setFormOpen(true);
  }

  function openEdit(formaPago: FormaPago) {
    setEditingFormaPago(formaPago);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingFormaPago(null);
  }

  async function handleCreate(data: FormaPagoFormInput) {
    await createMutation.mutateAsync(data);
    closeForm();
  }

  async function handleUpdate(data: FormaPagoFormInput) {
    if (!editingFormaPago) return;
    await updateMutation.mutateAsync({ id: editingFormaPago.id, data });
    closeForm();
  }

  async function handleDelete() {
    if (!deletingFormaPago) return;
    await deleteMutation.mutateAsync(deletingFormaPago.id);
    setDeletingFormaPago(null);
    if (formasPago.length === 1 && page > 1) {
      setPage(page - 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-normal tracking-tight">Formas de pago</h2>
          <p className="text-muted-foreground">Gestiona tus tarjetas y cuentas para pagos.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva forma de pago
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total} forma{total !== 1 ? "s" : ""} de pago
        </p>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar forma de pago..."
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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <FormaPagoCardSkeleton key={i} />
          ))}
        </div>
      ) : formasPago.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">No tienes formas de pago</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrega tu primera tarjeta o cuenta para empezar.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {formasPago.map((fp) => (
              <FormaPagoCard
                key={fp.id}
                formaPago={fp}
                onEdit={openEdit}
                onDelete={(id) => {
                  const found = formasPago.find((f) => f.id === id);
                  if (found) setDeletingFormaPago(found);
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Pagina {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      <FormaPagoDialog
        open={formOpen}
        onClose={closeForm}
        title={editingFormaPago ? "Editar forma de pago" : "Nueva forma de pago"}
      >
        <FormaPagoForm
          defaultValues={editingFormaPago}
          onSubmit={editingFormaPago ? handleUpdate : handleCreate}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </FormaPagoDialog>

      <DeleteFormaPagoDialog
        open={!!deletingFormaPago}
        onClose={() => setDeletingFormaPago(null)}
        onConfirm={handleDelete}
        formaPagoName={deletingFormaPago?.nombre ?? ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
