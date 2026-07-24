import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import { TransactionsTableSkeleton } from "@/features/transactions/components/transactions-table-skeleton";
import { DeleteTransactionDialog } from "@/features/transactions/components/delete-transaction-dialog";
import { Dialog } from "@/features/categories/components/category-dialog";
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

export const Route = createFileRoute("/dashboard/gastos")({
  component: GastosPage,
});

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function GastosPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions({
    type: "EXPENSE",
    search: search || undefined,
    month,
    year,
    page,
    limit: 10,
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
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseDialog();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    await deleteMutation.mutateAsync(deletingTransaction.id);
    setDeletingTransaction(null);
  };

  const transactions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gastos</h2>
          <p className="text-muted-foreground">Gestiona tus gastos</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Nuevo gasto
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
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
            <div className="flex items-center gap-2">
              <Select
                value={month}
                onChange={(e) => {
                  setMonth(Number(e.target.value));
                  setPage(1);
                }}
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
        title={editingTransaction ? "Editar gasto" : "Nuevo gasto"}
      >
        <TransactionForm
          defaultValues={editingTransaction}
          defaultType="EXPENSE"
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
    </div>
  );
}
