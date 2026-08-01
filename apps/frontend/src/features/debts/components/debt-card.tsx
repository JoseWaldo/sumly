import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Coins, User, Calendar, AlertTriangle } from "lucide-react";
import type { Debt, DebtEstado } from "@/features/debts/schemas/debt.schema";

const ESTADO_LABELS: Record<DebtEstado, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  ESPERANDO_CONFIRMACION: { label: "Esperando", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  PAGADA: { label: "Pagada", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  DISPUTADA: { label: "Disputada", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  VENCIDA: { label: "Vencida", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  CANCELADA: { label: "Cancelada", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  PERDONADA: { label: "Perdonada", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
};

function formatMoney(v: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

interface DebtCardProps {
  debt: Debt;
  direction: "Me deben" | "Yo debo";
  onSelect: () => void;
  onPay: () => void;
}

export function DebtCard({ debt, direction, onSelect, onPay }: DebtCardProps) {
  const estado = ESTADO_LABELS[debt.estado] ?? { label: debt.estado, className: "bg-muted text-muted-foreground" };
  const vencida = debt.estado === "VENCIDA";
  const pagada = debt.estado === "PAGADA" || debt.estado === "CANCELADA" || debt.estado === "PERDONADA";
  const isDeudor = direction === "Yo debo";

  const nombre = debt.contraparteSnapshotNombre || debt.deudorNombreLibre || "Sin nombre";

  return (
    <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{nombre}</p>
            {debt.abonos && debt.abonos.total > 0 && (
              <p className="text-xs text-muted-foreground">
                Saldo: {formatMoney(debt.saldoPendiente)} / {formatMoney(debt.monto)}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${estado.className}`}>
            {debt.estado === "DISPUTADA" && <AlertTriangle className="mr-1 h-3 w-3" />}
            {estado.label}
          </span>
          <p className={`text-sm font-semibold ${pagada ? "text-muted-foreground" : isDeudor ? "text-rose-500" : "text-emerald-500"}`}>
            {formatMoney(debt.saldoPendiente || debt.monto)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span className={vencida ? "text-destructive" : ""}>
            Vence {formatDate(debt.createdAt)}
          </span>
        </div>
        {isDeudor && !pagada && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPay();
            }}
          >
            <Coins className="mr-1 h-3.5 w-3.5" />
            Pagar
          </Button>
        )}
      </div>
    </Card>
  );
}

export function DebtCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-1 h-3 w-16" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="mt-3">
        <Skeleton className="h-3.5 w-32" />
      </div>
    </Card>
  );
}
