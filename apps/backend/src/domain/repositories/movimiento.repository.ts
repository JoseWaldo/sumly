import type { MovimientoEntity, MovimientoTipo, MovimientoOrigenTipo } from "@/domain/entities/movimiento.entity";

export interface CreateMovimientoInput {
  userId: string;
  tipo: MovimientoTipo;
  monto: number;
  origenTipo: MovimientoOrigenTipo;
  origenId: string;
}

export interface CreateReversaInput {
  movimientoOriginalId: string;
}

export interface IMovimientoRepository {
  create(input: CreateMovimientoInput): Promise<MovimientoEntity>;
  createReversa(input: CreateReversaInput): Promise<MovimientoEntity>;
  findById(id: string): Promise<MovimientoEntity | null>;
  getNeutralNet(userId: string): Promise<number>;
}
