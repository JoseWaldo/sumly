import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { FileUpload } from "@/components/ui/file-upload";
import type { Debt } from "@/features/debts/schemas/debt.schema";

interface FormaPago {
  id: string;
  nombre: string;
  tipo: string;
  ultimosCuatro?: string | null;
}

interface PayDebtDialogProps {
  open: boolean;
  onClose: () => void;
  debt: Debt | null;
  formasPago: FormaPago[];
  onSubmit: (data: { monto: number; formaPagoId: string; comprobanteFileId?: string; idempotencyKey: string }) => Promise<void>;
  isLoading: boolean;
}

export function PayDebtDialog({ open, onClose, debt, formasPago, onSubmit, isLoading }: PayDebtDialogProps) {
  const [monto, setMonto] = useState<number>(debt?.saldoPendiente ?? 0);
  const [formaPagoId, setFormaPagoId] = useState("");
  const [comprobanteId, setComprobanteId] = useState<string | undefined>();
  const [error, setError] = useState("");

  if (!open || !debt) return null;

  const maxMonto = debt.saldoPendiente;

  const handleSubmit = async () => {
    setError("");
    if (monto <= 0 || monto > maxMonto) {
      setError(`El monto debe ser mayor a 0 y no superar ${maxMonto}`);
      return;
    }
    if (!formaPagoId) {
      setError("Selecciona una forma de pago");
      return;
    }

    const idempotencyKey = crypto.randomUUID();
    try {
      await onSubmit({ monto, formaPagoId, comprobanteFileId: comprobanteId, idempotencyKey });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Error al reportar pago");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-scale-in rounded-xl border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-foreground">Reportar pago</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {debt.contraparteSnapshotNombre || debt.deudorNombreLibre} — saldo pendiente: ${debt.saldoPendiente.toLocaleString("es-CO")}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <Label>Monto del abono</Label>
            <CurrencyInput value={monto} onChange={setMonto} placeholder="0" />
          </div>

          <div>
            <Label>Forma de pago</Label>
            <Select value={formaPagoId} onChange={(e: any) => setFormaPagoId(e.target.value)}>
              <option value="">Seleccionar...</option>
              {formasPago.map((fp) => (
                <option key={fp.id} value={fp.id}>
                  {fp.nombre} {fp.ultimosCuatro ? `(*${fp.ultimosCuatro})` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Comprobante (opcional)</Label>
            <FileUpload
              onUploaded={(result) => setComprobanteId(result.id)}
              onError={(err) => setError(err)}
              acceptTypes={["image/jpeg", "image/png", "image/webp"]}
              maxSize={10 * 1024 * 1024}
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Procesando..." : "Reportar pago"}
          </Button>
        </div>
      </div>
    </div>
  );
}
