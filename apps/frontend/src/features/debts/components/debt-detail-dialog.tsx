import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, RotateCcw, Coins, Calendar, User } from "lucide-react";
import type { DebtWithGrupo, Abono, DebtEvent } from "@/features/debts/schemas/debt.schema";

function formatMoney(v: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface DebtDetailDialogProps {
  open: boolean;
  onClose: () => void;
  debt: DebtWithGrupo | null;
  abonos: Abono[];
  eventos: DebtEvent[];
  isAcreedor: boolean;
  isDeudor: boolean;
  onPay: () => void;
  onConfirm: (abonoId: string) => void;
  onReject: (abonoId: string) => void;
  onCancel: () => void;
  onForgive: () => void;
  onResolveDisputa: (accion: "regresar_pendiente" | "forzar_pagada") => void;
  isLoading: boolean;
}

export function DebtDetailDialog({
  open, onClose, debt, abonos, eventos, isAcreedor, isDeudor,
  onPay, onConfirm, onReject, onCancel, onForgive, onResolveDisputa, isLoading,
}: DebtDetailDialogProps) {
  if (!open || !debt) return null;

  const nombre = debt.contraparteSnapshotNombre || debt.deudorNombreLibre || "Sin nombre";
  const pagada = debt.estado === "PAGADA";
  const cancelada = debt.estado === "CANCELADA" || debt.estado === "PERDONADA";
  const terminal = pagada || cancelada;
  const disputada = debt.estado === "DISPUTADA";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-scale-in rounded-xl border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{nombre}</h2>
              <p className="text-sm text-muted-foreground">{debt.grupo.descripcion}</p>
            </div>
          </div>
        </div>

        {/* Montos */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">{formatMoney(debt.monto)}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className="text-lg font-semibold">{formatMoney(debt.saldoPendiente)}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Vence</p>
            <p className="text-sm font-medium">{new Date(debt.grupo.fechaVencimiento).toLocaleDateString("es-CO")}</p>
          </Card>
        </div>

        {/* Abonos */}
        {abonos.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Abonos</h3>
            <div className="space-y-2">
              {abonos.map((ab) => (
                <div key={ab.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{formatMoney(ab.monto)}</p>
                      <p className="text-xs text-muted-foreground">{ab.formaPago?.nombre} — {formatDate(ab.createdAt)}</p>
                      {ab.comprobanteFileId && (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/api/v1/files/${ab.comprobanteFileId}/view`}
                          alt="Comprobante"
                          className="mt-1 max-h-24 rounded cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      ab.estado === "CONFIRMADO" ? "bg-emerald-100 text-emerald-700" :
                      ab.estado === "RECHAZADO" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {ab.estado === "CONFIRMADO" ? "Confirmado" : ab.estado === "RECHAZADO" ? "Rechazado" : "Pendiente"}
                    </span>
                    {isAcreedor && ab.estado === "PENDIENTE_CONFIRMACION" && (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500" onClick={() => onConfirm(ab.id)} disabled={isLoading}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onReject(ab.id)} disabled={isLoading}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eventos */}
        {eventos.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Historial</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
              {eventos.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>{formatDate(ev.createdAt)}</span>
                  <span>—</span>
                  <span className="font-medium">{ev.tipoEvento.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {!terminal && (
          <div className="mt-6 flex flex-wrap gap-2">
            {isDeudor && (
              <Button onClick={onPay} size="sm">
                <Coins className="mr-1 h-4 w-4" /> Pagar
              </Button>
            )}
            {isAcreedor && (
              <>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button variant="outline" size="sm" onClick={onForgive} disabled={isLoading}>
                  Perdonar
                </Button>
                {disputada && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onResolveDisputa("regresar_pendiente")} disabled={isLoading}>
                      <RotateCcw className="mr-1 h-3.5 w-3.5" /> A Pendiente
                    </Button>
                    <Button variant="default" size="sm" onClick={() => onResolveDisputa("forzar_pagada")} disabled={isLoading}>
                      Forzar pagada
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
