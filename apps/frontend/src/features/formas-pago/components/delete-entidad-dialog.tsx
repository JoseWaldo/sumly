import { Button } from "@/components/ui/button";
import { FormaPagoDialog } from "@/features/formas-pago/components/forma-pago-dialog";

interface DeleteEntidadDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entidadName: string;
  isLoading?: boolean;
}

export function DeleteEntidadDialog({
  open,
  onClose,
  onConfirm,
  entidadName,
  isLoading,
}: DeleteEntidadDialogProps) {
  return (
    <FormaPagoDialog open={open} onClose={onClose} title="Eliminar entidad financiera">
      <p className="text-sm text-muted-foreground">
        Estas seguro de que deseas eliminar &quot;{entidadName}&quot;? Esta accion no se puede deshacer.
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
