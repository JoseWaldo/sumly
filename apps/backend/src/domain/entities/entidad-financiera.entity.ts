export interface EntidadFinancieraEntity {
  id: string;
  nombre: string;
  gradienteInicio: string;
  gradienteFin: string;
  formatoNumero: string | null;
  esSistema: boolean;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
