import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  subscriptionName?: string;
  subscriptionAmount?: string;
}

export function DeleteSubscriptionDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  subscriptionName,
  subscriptionAmount,
}: DeleteSubscriptionDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-border/30 bg-card p-6 shadow-lg animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium">Eliminar suscripción</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 flex items-start gap-3 rounded-lg border border-chart-4/20 bg-chart-4/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-chart-4" />
          <div className="text-sm">
            <p className="font-medium">
              {subscriptionName ? `¿Eliminar "${subscriptionName}"?` : "¿Eliminar esta suscripción?"}
            </p>
            {subscriptionAmount && (
              <p className="mt-0.5 text-muted-foreground">{subscriptionAmount}</p>
            )}
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Esta acción no se puede deshacer. Se eliminará la suscripción y todo su historial de pagos.
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
