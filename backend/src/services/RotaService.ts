import { Rota } from "@prisma/client";
import { BaseService } from "./BaseService";
import { RotaRepository } from "../repositories/RotaRepository";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";

export class RotaService extends BaseService<
  Rota,
  CreateRotaDTO,
  UpdateRotaDTO
> {
  constructor(repository: RotaRepository) {
    super(repository);
  }

  protected async validateCreateData(data: CreateRotaDTO): Promise<void> {
    if (!data.nome || data.nome.trim().length < 3) {
      throw CommonErrors.BAD_REQUEST(
        "O nome da rota deve ter pelo menos 3 caracteres."
      );
    }
  }

  protected async validateUpdateData(data: UpdateRotaDTO): Promise<void> {
    if (
      data.nome !== undefined &&
      (!data.nome || data.nome.trim().length < 3)
    ) {
      throw CommonErrors.BAD_REQUEST(
        "O nome da rota deve ter pelo menos 3 caracteres."
      );
    }
  }
}
