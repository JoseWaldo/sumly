import { Button } from "@/components/ui/button";
import { Dialog } from "@/features/categories/components/category-dialog";

interface DeleteCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  isLoading?: boolean;
}

export function DeleteCategoryDialog({
  open,
  onClose,
  onConfirm,
  categoryName,
  isLoading,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Eliminar categoria">
      <p className="text-sm text-muted-foreground">
        Estas seguro de que deseas eliminar la categoria &quot;{categoryName}&quot;? Esta accion no se puede deshacer.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </Dialog>
  );
}
