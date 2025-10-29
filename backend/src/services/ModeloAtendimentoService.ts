import { ModeloAtendimento } from "@prisma/client";
import { BaseService } from "./BaseService";
import { ModeloAtendimentoRepository } from "../repositories/ModeloAtendimentoRepository";
import { CreateModeloAtendimentoDTO, UpdateModeloAtendimentoDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";

export class ModeloAtendimentoService extends BaseService<
  ModeloAtendimento,
  CreateModeloAtendimentoDTO,
  UpdateModeloAtendimentoDTO
> {
  constructor(repository: ModeloAtendimentoRepository) {
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
    data: CreateModeloAtendimentoDTO
  ): Promise<void> {
    if (!data.nome || data.nome.trim().length < 3) {
      throw CommonErrors.BAD_REQUEST(
        "O nome do modelo deve ter pelo menos 3 caracteres."
      );
    }
  }

  protected async validateUpdateData(
    data: UpdateModeloAtendimentoDTO
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
