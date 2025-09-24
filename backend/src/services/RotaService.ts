import { Rota } from "@prisma/client";
import { BaseService } from "./BaseService";
import { RotaRepository } from "../repositories/RotaRepository";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";

interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class RotaService extends BaseService<
  Rota,
  CreateRotaDTO,
  UpdateRotaDTO
> {
  private rotaRepository: RotaRepository;

  constructor(repository: RotaRepository) {
    super(repository);
    this.rotaRepository = repository;
  }
  
  /**
   * Sobrescreve o método delete para verificar se há entregas associadas
   */
  async delete(id: string): Promise<Rota> {
    if (!id) {
      throw CommonErrors.BAD_REQUEST("ID é obrigatório");
    }
    
    const rota = await this.rotaRepository.findByIdWithRelations(id);
    if (!rota) {
      throw CommonErrors.NOT_FOUND("Rota não encontrada");
    }
    
    const rotaWithRelations = rota as Rota & { entregas: any[] };
    if (rotaWithRelations.entregas && rotaWithRelations.entregas.length > 0) {
      throw CommonErrors.BAD_REQUEST(
        "Não é possível excluir a rota pois existem entregas associadas a ela. Remova as entregas primeiro."
      );
    }
    
    return super.delete(id);
  }

  /**
   * Busca todas as rotas com paginação, filtros e relacionamentos
   */
  async findAllWithRelations(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<PaginationResult<Rota>> {
    const skip = (page - 1) * limit;

    const [rotas, total] = await Promise.all([
      this.rotaRepository.findAllWithRelations({
        skip,
        take: limit,
        where: filters,
        orderBy: { dataEntrega: 'desc' },
      }),
      this.rotaRepository.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: rotas,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Busca uma rota por ID com relacionamentos
   */
  async findByIdWithRelations(id: string): Promise<Rota | null> {
    const rota = await this.rotaRepository.findByIdWithRelations(id);
    
    if (!rota) {
      throw CommonErrors.NOT_FOUND("Rota não encontrada");
    }

    return rota;
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
