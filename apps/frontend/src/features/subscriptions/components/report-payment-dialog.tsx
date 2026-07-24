import { useRef, useEffect, useState } from "react";
import { X, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import type { Subscription } from "@/features/subscriptions/schemas/subscription.schema";
import { formatCurrencyCOP, formatDateCol } from "@/lib/date-utils";
import { todayCol } from "@/lib/date-utils";

interface ReportPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSubmit: (date: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReportPaymentDialog({ open, onClose, subscription, onSubmit, isLoading }: ReportPaymentDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState(todayCol());

  useEffect(() => {
    if (open) setDate(todayCol());
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !subscription) return null;

  const handleSubmit = async () => {
    await onSubmit(date);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-[98%] max-w-sm max-h-[90vh] overflow-y-auto rounded-xl border border-border/30 bg-card p-6 shadow-lg sm:w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium">Reportar pago</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border/30 bg-muted/20 p-3 space-y-2">
            <p className="font-medium">{subscription.name}</p>
            <p className="text-2xl font-normal tabular-nums">{formatCurrencyCOP(subscription.amount)}</p>
            <p className="text-xs text-muted-foreground">
              Proximo pago: {formatDateCol(subscription.nextPaymentDate, "dd MMM yyyy")}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Fecha del pago</p>
            <DateInput value={date} onChange={setDate} />
            <p className="mt-1 text-xs text-muted-foreground">
              Se registrara como un gasto en la categoria Suscripciones
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              <CreditCard className="mr-1.5 h-4 w-4" />
              {isLoading ? "Reportando..." : "Confirmar pago"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
