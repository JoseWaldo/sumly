export type MovimientoTipo = "ENTRADA" | "SALIDA";
export type MovimientoNaturaleza = "REAL" | "NEUTRAL";
export type MovimientoOrigenTipo = "MANUAL" | "DEUDA" | "AHORRO" | "SUSCRIPCION";

export interface MovimientoEntity {
  id: string;
  userId: string;
  tipo: MovimientoTipo;
  naturaleza: MovimientoNaturaleza;
  monto: number;
  origenTipo: MovimientoOrigenTipo;
  origenId: string | null;
  reversaDeId: string | null;
  editable: boolean;
  createdAt: Date;
}
