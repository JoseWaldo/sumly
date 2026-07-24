import { Button } from "@/components/ui/button";
import { FormaPagoDialog } from "@/features/formas-pago/components/forma-pago-dialog";

interface DeleteFormaPagoDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formaPagoName: string;
  isLoading?: boolean;
}

export function DeleteFormaPagoDialog({
  open,
  onClose,
  onConfirm,
  formaPagoName,
  isLoading,
}: DeleteFormaPagoDialogProps) {
  return (
    <FormaPagoDialog open={open} onClose={onClose} title="Eliminar forma de pago">
      <p className="text-sm text-muted-foreground">
        Estas seguro de que deseas eliminar &quot;{formaPagoName}&quot;? Esta accion no se puede deshacer.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </FormaPagoDialog>
  );
}
