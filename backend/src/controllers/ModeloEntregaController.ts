import { ModeloEntrega } from "@prisma/client";
import { BaseController } from "./BaseController";
import { ModeloEntregaService } from "../services/ModeloEntregaService";
import { CreateModeloEntregaDTO, UpdateModeloEntregaDTO } from "../models/DTOs";

export class ModeloEntregaController extends BaseController<
  ModeloEntrega,
  CreateModeloEntregaDTO,
  UpdateModeloEntregaDTO
> {
  constructor(service: ModeloEntregaService) {
    super(service);
  }

  /**
   * Constrói filtros a partir dos query parameters
   */
  protected buildFilters(query: any): any {
    const filters: any = {};

    // Busca inteligente - prioridade: nome, descricao
    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { descricao: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return filters;
  }
}
