import { Calendar, CreditCard, Edit, MoreHorizontal, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Subscription } from "@/features/subscriptions/schemas/subscription.schema";
import { formatCurrencyCOP, formatDateCol } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: "Mensual",
  YEARLY: "Anual",
  QUARTERLY: "Trimestral",
  BIWEEKLY: "Quincenal",
  WEEKLY: "Semanal",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Activa", className: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
  PAUSED: { label: "Pausada", className: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  CANCELLED: { label: "Cancelada", className: "bg-muted text-muted-foreground border-border/50" },
};

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onReport: (subscription: Subscription) => void;
  onViewPaymentMethod: (formaPago: Subscription["formaPago"]) => void;
}

export function SubscriptionCard({ subscription, onEdit, onDelete, onReport, onViewPaymentMethod }: SubscriptionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_CONFIG[subscription.status];
  const fp = subscription.formaPago;
  const entidadNombre = fp.entidadFinancieraNombre ?? fp.nombre;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/30 bg-card p-5 transition-colors hover:border-primary/20",
        subscription.status === "CANCELLED" && "opacity-60"
      )}
    >
      <div className="mb-1 flex items-start justify-between">
        <h3 className="truncate pr-6 text-base font-medium">{subscription.name}</h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 min-w-36 max-w-48 rounded-lg border border-border/30 bg-card p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(subscription); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Editar</span>
                </button>
                {subscription.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onReport(subscription); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-chart-2 hover:bg-accent cursor-pointer"
                  >
                    <CreditCard className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Reportar pago</span>
                  </button>
                )}
                {subscription.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete(subscription.id); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-chart-4 hover:bg-accent cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Eliminar</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="mb-3 text-2xl font-normal tabular-nums">{formatCurrencyCOP(subscription.amount)}</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center rounded-md border border-border/30 bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
          {FREQUENCY_LABELS[subscription.frequency] ?? subscription.frequency}
        </span>
        <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs", status.className)}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        <span>Próx. pago: {formatDateCol(subscription.nextPaymentDate, "dd MMM yyyy")}</span>
      </div>

      <button
        type="button"
        onClick={() => onViewPaymentMethod(fp)}
        className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {entidadNombre}
        <ChevronRight className="h-3 w-3 shrink-0" />
      </button>

      {subscription.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {subscription.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {subscription.status === "ACTIVE" && (
        <div className="mt-4 pt-3 border-t border-border/20">
          <Button
            size="sm"
            className="w-full cursor-pointer"
            onClick={() => onReport(subscription)}
          >
            <CreditCard className="mr-1.5 h-3.5 w-3.5" />
            Reportar pago
          </Button>
        </div>
      )}
    </div>
  );
}
