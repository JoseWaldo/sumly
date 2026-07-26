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
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (column: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

type SortableHeaderProps = {
  column: string;
  label: string;
  currentSortBy?: string;
  currentSortDir?: string;
  onSort?: (column: string) => void;
  className?: string;
};

function SortableHeader({ column, label, currentSortBy, currentSortDir: _currentSortDir, onSort, className }: SortableHeaderProps) {
  const isActive = currentSortBy === column;
  return (
    <button
      type="button"
      onClick={() => onSort?.(column)}
      className={cn(
        "flex items-center gap-1 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground",
        className
      )}
    >
      {label}
      <ArrowUpDown
        className={cn("h-3 w-3", isActive && "text-primary")}
      />
    </button>
  );
}

export function TransactionsTable({
  transactions,
  page,
  totalPages,
  total,
  sortBy,
  sortDir,
  onSort,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  return (
    <div>
      <div className="overflow-x-auto max-w-[calc(100vw-2rem)] md:max-w-none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-4 py-3 text-left" style={{ width: 60 }}>
                <span className="text-xs font-medium text-muted-foreground">Tipo</span>
              </th>
              <th className="px-4 py-3 text-left" style={{ width: 130 }}>
                <SortableHeader
                  column="date"
                  label="Fecha"
                  currentSortBy={sortBy}
                  currentSortDir={sortDir}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-left" style={{ width: 160 }}>
                <SortableHeader
                  column="category"
                  label="Categoria"
                  currentSortBy={sortBy}
                  currentSortDir={sortDir}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-left" style={{ width: 180 }}>
                <span className="text-xs font-medium text-muted-foreground">Descripcion</span>
              </th>
              <th className="px-4 py-3 text-left" style={{ width: 140 }}>
                <SortableHeader
                  column="forma_pago"
                  label="Forma de pago"
                  currentSortBy={sortBy}
                  currentSortDir={sortDir}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-right" style={{ width: 120 }}>
                <SortableHeader
                  column="amount"
                  label="Monto"
                  currentSortBy={sortBy}
                  currentSortDir={sortDir}
                  onSort={onSort}
                  className="ml-auto"
                />
              </th>
              <th className="px-4 py-3 text-right" style={{ width: 70 }} />
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const type = tx.category?.type;
              return (
                <tr
                  key={tx.id}
                  className="border-b border-border/20 transition-colors hover:bg-accent/30 last:border-0"
                >
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                        type === "INCOME"
                          ? "bg-chart-2/10 text-chart-2"
                          : "bg-chart-4/10 text-chart-4"
                      )}
                    >
                      {type === "INCOME" ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{formatDateCol(tx.date, "dd MMM yyyy")}</span>
                  </td>
                  <td className="px-4 py-3">
                    {tx.category ? (
                      <div className="flex items-center gap-1.5">
                        <LazyIcon name={tx.category.icon} className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{tx.category.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {tx.description || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tx.formaPago ? (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${tx.formaPago.gradienteInicio}, ${tx.formaPago.gradienteFin})`,
                          }}
                        />
                        <span className="text-sm truncate max-w-[100px]">{tx.formaPago.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "text-sm font-medium tabular-nums",
                        type === "INCOME" ? "text-chart-2" : "text-chart-4"
                      )}
                    >
                      {type === "INCOME" ? "+" : "-"}
                      {formatCurrencyCOP(tx.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tx)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
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
