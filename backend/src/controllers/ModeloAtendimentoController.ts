import { ModeloAtendimento } from "@prisma/client";
import { BaseController } from "./BaseController";
import { ModeloAtendimentoService } from "../services/ModeloAtendimentoService";
import { CreateModeloAtendimentoDTO, UpdateModeloAtendimentoDTO } from "../models/DTOs";

export class ModeloAtendimentoController extends BaseController<
  ModeloAtendimento,
  CreateModeloAtendimentoDTO,
  UpdateModeloAtendimentoDTO
> {
  constructor(service: ModeloAtendimentoService) {
    super(service);
  }

  /**
   * Constrói filtros a partir dos query parameters
   */
  protected buildFilters(query: any): any {
    const filters: any = {};

    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { descricao: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return filters;
  }
}
