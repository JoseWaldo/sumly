export type FormaPagoTipo = "CREDIT" | "DEBIT" | "CASH";

export interface FormaPagoEntity {
  id: string;
  nombre: string;
  tipo: FormaPagoTipo;
  numeroEncriptado: string | null;
  ultimosCuatro: string | null;
  publico: boolean;
  gradienteInicio: string;
  gradienteFin: string;
  entidadFinancieraId: string | null;
  formatoNumero: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
