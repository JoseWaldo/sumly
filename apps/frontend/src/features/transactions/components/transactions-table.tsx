import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateCol, formatCurrencyCOP } from "@/lib/date-utils";
import { LazyIcon } from "@/features/categories/components/icon-picker";
import type { Transaction } from "@/features/transactions/schemas/transaction.schema";

interface TransactionsTableProps {
  transactions: Transaction[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  page,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        id: "date",
        accessorKey: "date",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground cursor-pointer"
          >
            Fecha
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ getValue }) => {
          const dateStr = getValue<string>();
          return <span className="text-sm">{formatDateCol(dateStr, "dd MMM yyyy")}</span>;
        },
        size: 140,
      },
      {
        id: "category",
        accessorKey: "category",
        header: "Categoria",
        cell: ({ getValue }) => {
          const category = getValue<Transaction["category"]>();
          if (!category) return <span className="text-sm text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <LazyIcon name={category.icon} className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{category.name}</span>
            </div>
          );
        },
        size: 180,
        enableSorting: false,
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Descripcion",
        cell: ({ getValue }) => {
          const desc = getValue<string | null>();
          return (
            <span className="text-sm text-muted-foreground">
              {desc || "—"}
            </span>
          );
        },
        size: 200,
        enableSorting: false,
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground cursor-pointer ml-auto"
          >
            Monto
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ getValue, row }) => {
          const amount = getValue<number>();
          const type = row.original.category?.type;
          return (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                type === "INCOME"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {type === "INCOME" ? "+" : "-"}
              {formatCurrencyCOP(amount)}
            </span>
          );
        },
        size: 130,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => onEdit(transaction)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                title="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(transaction)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        },
        size: 80,
        enableSorting: false,
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className="overflow-x-auto max-w-[calc(100vw-2rem)] md:max-w-none">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/30">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/20 transition-colors hover:bg-accent/30 last:border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No hay movimientos para mostrar
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col gap-2 border-t border-border/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {total} movimiento{total !== 1 ? "s" : ""} — Pagina {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - page) <= 1) return true;
                return false;
              })
              .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) {
                  acc.push("ellipsis");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="flex h-7 w-7 items-center justify-center text-xs text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onPageChange(item)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors cursor-pointer",
                      item === page
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
