import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Debt } from "@/features/debts/schemas/debt.schema";

interface DeleteDebtDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading: boolean;
  debt?: Debt | null;
}

export function DeleteDebtDialog({ open, onClose, onConfirm, isLoading, debt }: DeleteDebtDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  const nombre = debt?.contraparteSnapshotNombre ?? debt?.deudorNombreLibre ?? "esta deuda";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-scale-in rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground">Eliminar deuda</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Vas a eliminar la deuda con{" "}
          <span className="font-medium text-foreground">{nombre}</span>. Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleting || isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleting || isLoading}>
            {deleting || isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
