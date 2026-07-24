import { Copy, Eye, EyeOff, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useState, useCallback } from "react";
import type { FormaPago } from "@/features/formas-pago/schemas/forma-pago.schema";
import { formatWithPattern } from "@/features/formas-pago/schemas/forma-pago.schema";
import { useRevealFormaPago } from "@/features/formas-pago/hooks/use-formas-pago";
import { cn } from "@/lib/utils";

const TIPO_LABELS: Record<string, string> = {
  CREDIT: "Credito",
  DEBIT: "Debito",
  CASH: "Efectivo",
};

const TIPO_BADGE_STYLES: Record<string, string> = {
  CREDIT: "bg-white/20 text-white border-white/30",
  DEBIT: "bg-white/15 text-white border-white/25",
  CASH: "bg-white/15 text-white border-white/25",
};

interface FormaPagoCardProps {
  formaPago: FormaPago;
  onEdit: (formaPago: FormaPago) => void;
  onDelete: (id: string) => void;
}

export function FormaPagoCard({ formaPago, onEdit, onDelete }: FormaPagoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [numero, setNumero] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const revealMutation = useRevealFormaPago();

  const handleToggleReveal = useCallback(async () => {
    if (revealed) {
      setRevealed(false);
      setNumero(null);
      return;
    }
    try {
      const result = await revealMutation.mutateAsync(formaPago.id);
      setNumero(result.numero);
      setRevealed(true);
    } catch {
      // El error lo maneja el error boundary/middleware
    }
  }, [revealed, formaPago.id, revealMutation]);

  const handleCopy = useCallback(async () => {
    if (!numero) return;
    const formatted = formatWithPattern(numero, formaPago.formatoNumero);
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso
    }
  }, [numero, formaPago.formatoNumero]);

  const numeroMostrado = numero ? formatWithPattern(numero, formaPago.formatoNumero) : null;

  const isEfectivo = formaPago.tipo === "CASH";

  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-xl p-5 text-white shadow-md transition-transform hover:scale-[1.02] min-h-[180px]"
      style={{
        background: `linear-gradient(135deg, ${formaPago.gradienteInicio}, ${formaPago.gradienteFin})`,
      }}
    >
      <div className="absolute top-3 right-3 flex gap-1">
        {!isEfectivo && !formaPago.publico && (
          <div className="flex items-center justify-center rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
            <EyeOff className="mr-0.5 h-3 w-3" />
            Privada
          </div>
        )}
        {menuOpen ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-0 z-20 min-w-32 rounded-lg border border-white/20 bg-black/40 p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEdit(formaPago); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white hover:bg-white/20 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 shrink-0" />
                Editar
              </button>
              {!isEfectivo && (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(formaPago.id); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-red-200 hover:bg-white/20 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  Eliminar
                </button>
              )}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-black/20 text-white/80 hover:bg-black/40 cursor-pointer"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-2">
        <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", TIPO_BADGE_STYLES[formaPago.tipo] ?? "bg-white/15 text-white border-white/25")}>
          {TIPO_LABELS[formaPago.tipo]}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="text-lg font-medium leading-tight">{formaPago.nombre}</h3>
      </div>

      {!isEfectivo && (
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-lg tracking-wider">
              {revealed && numeroMostrado ? (
                <span>{numeroMostrado}</span>
              ) : (
                <span>
                  {formaPago.publico ? (
                    <span className="text-white/80">•••• {formaPago.ultimosCuatro}</span>
                  ) : (
                    <span className="text-white/60">•••• •••• •••• {formaPago.ultimosCuatro}</span>
                  )}
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleToggleReveal}
                disabled={revealMutation.isPending}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-white/80 hover:bg-black/40 cursor-pointer disabled:opacity-50"
              >
                {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              {revealed && numero && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-white/80 hover:bg-black/40 cursor-pointer"
                >
                  {copied ? (
                    <span className="text-[10px] font-bold text-green-300">OK</span>
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
