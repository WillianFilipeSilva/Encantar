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

  async search(searchTerm: string, page: number = 1, limit: number = 10) {
    const filters = {
      OR: [
        { nome: { contains: searchTerm, mode: "insensitive" } },
        { descricao: { contains: searchTerm, mode: "insensitive" } }
      ]
    };

    return await this.repository.findAll(page, limit, filters);
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
