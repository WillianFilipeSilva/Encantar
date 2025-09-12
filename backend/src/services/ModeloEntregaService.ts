import { ModeloEntrega } from "@prisma/client";
import { BaseService } from "./BaseService";
import { ModeloEntregaRepository } from "../repositories/ModeloEntregaRepository";
import { CreateModeloEntregaDTO, UpdateModeloEntregaDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";

export class ModeloEntregaService extends BaseService<
  ModeloEntrega,
  CreateModeloEntregaDTO,
  UpdateModeloEntregaDTO
> {
  constructor(repository: ModeloEntregaRepository) {
    super(repository);
  }

  protected async validateCreateData(
    data: CreateModeloEntregaDTO
  ): Promise<void> {
    if (!data.nome || data.nome.trim().length < 3) {
      throw CommonErrors.BAD_REQUEST(
        "O nome do modelo deve ter pelo menos 3 caracteres."
      );
    }
  }

  protected async validateUpdateData(
    data: UpdateModeloEntregaDTO
  ): Promise<void> {
    if (
      data.nome !== undefined &&
      (!data.nome || data.nome.trim().length < 3)
    ) {
      throw CommonErrors.BAD_REQUEST(
        "O nome do modelo deve ter pelo menos 3 caracteres."
      );
    }
  }
}
