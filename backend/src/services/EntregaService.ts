import { Entrega } from "@prisma/client";
import { BaseService } from "./BaseService";
import { EntregaRepository } from "../repositories/EntregaRepository";
import { CreateEntregaDTO, UpdateEntregaDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";

export class EntregaService extends BaseService<
  Entrega,
  CreateEntregaDTO,
  UpdateEntregaDTO
> {
  constructor(repository: EntregaRepository) {
    super(repository);
  }

  protected async validateCreateData(data: CreateEntregaDTO): Promise<void> {
    if (!data.beneficiarioId) {
      throw CommonErrors.BAD_REQUEST("O beneficiário é obrigatório.");
    }
    if (!data.rotaId) {
      throw CommonErrors.BAD_REQUEST("A rota é obrigatória.");
    }
    if (!data.items || data.items.length === 0) {
      throw CommonErrors.BAD_REQUEST("A entrega deve ter pelo menos um item.");
    }
  }
}
