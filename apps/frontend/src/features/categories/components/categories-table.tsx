import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LazyIcon } from "@/features/categories/components/icon-picker";
import type { Category } from "@/features/categories/schemas/category.schema";

interface CategoriesTableProps {
  categories: Category[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const typeLabels: Record<string, string> = {
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
};

export function CategoriesTable({
  categories,
  page,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: "icon",
        accessorKey: "icon",
        header: "",
        cell: ({ getValue }) => {
          const icon = getValue<string>();
          return <LazyIcon name={icon} className="h-4 w-4" />;
        },
        size: 48,
        enableSorting: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground cursor-pointer"
          >
            Nombre
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ getValue }) => <span className="text-sm font-medium">{getValue<string>()}</span>,
      },
      {
        id: "type",
        accessorKey: "type",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground cursor-pointer"
          >
            Tipo
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ getValue }) => {
          const type = getValue<string>();
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                type === "INCOME"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {typeLabels[type] ?? type}
            </span>
          );
        },
      },
      {
        id: "origin",
        accessorKey: "userId",
        header: "Origen",
        cell: ({ getValue }) => {
          const userId = getValue<string | null>();
          return (
            <span className="text-xs text-muted-foreground">
              {userId ? "Personalizada" : "Sistema"}
            </span>
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const category = row.original;
          const isSystem = category.userId === null;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => onEdit(category)}
                disabled={isSystem}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer",
                  isSystem
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={isSystem ? "No se puede editar una categoria del sistema" : "Editar"}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(category)}
                disabled={isSystem}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer",
                  isSystem
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                )}
                title={isSystem ? "No se puede eliminar una categoria del sistema" : "Eliminar"}
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
    data: categories,
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

      {categories.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No hay categorias para mostrar
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col gap-2 border-t border-border/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {total} categoria{total !== 1 ? "s" : ""} — Página {page} de {totalPages}
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
