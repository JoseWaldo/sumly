import { useRef, useEffect } from "react";
import { X, CreditCard } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type { SubscriptionFormaPago } from "@/features/subscriptions/schemas/subscription.schema";
import { cn } from "@/lib/utils";

const TIPO_LABELS: Record<string, string> = {
  CREDIT: "Credito",
  DEBIT: "Debito",
  CASH: "Efectivo",
};

interface PaymentMethodDetailModalProps {
  open: boolean;
  onClose: () => void;
  formaPago: SubscriptionFormaPago | null;
}

export function PaymentMethodDetailModal({ open, onClose, formaPago }: PaymentMethodDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !formaPago) return null;

  const entidadNombre = formaPago.entidadFinancieraNombre ?? "Sin entidad";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-[98%] max-w-sm overflow-hidden rounded-xl border border-border/30 bg-card shadow-lg sm:w-full">
        <div
          className="relative p-5 pb-8"
          style={{
            background: `linear-gradient(135deg, ${formaPago.gradienteInicio}, ${formaPago.gradienteFin})`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-white/80 hover:bg-black/40 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mt-1">
            <span className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium bg-white/20 text-white border-white/30"
            )}>
              {TIPO_LABELS[formaPago.tipo] ?? formaPago.tipo}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-medium text-white">{formaPago.nombre}</h2>

          {formaPago.tipo !== "CASH" && (
            <p className="mt-4 font-mono text-2xl tracking-[0.15em] text-white/90">
              •••• •••• •••• {formaPago.ultimosCuatro ?? "----"}
            </p>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Entidad financiera</span>
              <span className="font-medium">{entidadNombre}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">{TIPO_LABELS[formaPago.tipo] ?? formaPago.tipo}</span>
            </div>
            {formaPago.tipo !== "CASH" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ultimos digitos</span>
                <span className="font-mono font-medium tracking-wider">
                  {formaPago.ultimosCuatro ?? "----"}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Link
              to="/dashboard/formas-de-pago"
              className="inline-flex h-9 items-center rounded-md border border-border/30 bg-transparent px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <CreditCard className="mr-1.5 h-4 w-4" />
              Ir a formas de pago
            </Link>
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
