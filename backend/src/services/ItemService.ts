import { Item } from "@prisma/client";
import { BaseService } from "./BaseService";
import { ItemRepository } from "../repositories/ItemRepository";
import { CreateItemDTO, UpdateItemDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";

export class ItemService extends BaseService<
  Item,
  CreateItemDTO,
  UpdateItemDTO
> {
  private itemRepository: ItemRepository;

  constructor(itemRepository: ItemRepository) {
    super(itemRepository);
    this.itemRepository = itemRepository;
  }

  /**
   * Valida dados para criação
   */
  protected async validateCreateData(data: CreateItemDTO): Promise<void> {
    if (!data.nome || data.nome.trim().length === 0) {
      throw CommonErrors.VALIDATION_ERROR("Nome é obrigatório");
    }

    if (data.nome.length > 100) {
      throw CommonErrors.VALIDATION_ERROR("Nome deve ter no máximo 100 caracteres");
    }

    if (!data.unidade || data.unidade.trim().length === 0) {
      throw CommonErrors.VALIDATION_ERROR("Unidade é obrigatória");
    }

    if (data.unidade.length > 20) {
      throw CommonErrors.VALIDATION_ERROR("Unidade deve ter no máximo 20 caracteres");
    }

    if (data.descricao && data.descricao.length > 500) {
      throw CommonErrors.VALIDATION_ERROR("Descrição deve ter no máximo 500 caracteres");
    }
  }

  /**
   * Valida dados para atualização
   */
  protected async validateUpdateData(data: UpdateItemDTO): Promise<void> {
    if (data.nome !== undefined) {
      if (!data.nome || data.nome.trim().length === 0) {
        throw CommonErrors.VALIDATION_ERROR("Nome é obrigatório");
      }

      if (data.nome.length > 100) {
        throw CommonErrors.VALIDATION_ERROR("Nome deve ter no máximo 100 caracteres");
      }
    }

    if (data.unidade !== undefined) {
      if (!data.unidade || data.unidade.trim().length === 0) {
        throw CommonErrors.VALIDATION_ERROR("Unidade é obrigatória");
      }

      if (data.unidade.length > 20) {
        throw CommonErrors.VALIDATION_ERROR("Unidade deve ter no máximo 20 caracteres");
      }
    }

    if (
      data.descricao !== undefined &&
      data.descricao &&
      data.descricao.length > 500
    ) {
      throw CommonErrors.VALIDATION_ERROR("Descrição deve ter no máximo 500 caracteres");
    }
  }

  /**
   * Transforma dados antes da criação
   */
  protected transformData(data: Item): any {
    return {
      nome: data.nome.trim(),
      unidade: data.unidade.trim(),
      descricao: data.descricao?.trim() || null,
      ativo: true
    };
  }

  /**
   * Transforma dados para atualização
   */
  protected transformUpdateData(data: UpdateItemDTO, userId?: string): any {
    const transformed: any = this.addAuditData(userId);

    if (data.nome !== undefined) {
      transformed.nome = data.nome.trim();
    }

    if (data.unidade !== undefined) {
      transformed.unidade = data.unidade.trim();
    }

    if (data.descricao !== undefined) {
      transformed.descricao = data.descricao?.trim() || null;
    }

    if (data.ativo !== undefined) {
      transformed.ativo = data.ativo;
    }

    return transformed;
  }

  /**
   * Cria um novo item
   */
  async create(data: CreateItemDTO, userId: string): Promise<Item> {
    await this.validateCreateData(data);

    // Verifica se já existe um item com o mesmo nome
    const exists = await this.itemRepository.existsByNome(data.nome);
    if (exists) {
      throw CommonErrors.CONFLICT("Já existe um item com este nome");
    }

    const transformedData = {
      ...this.transformData(data as any),
      ...this.addAuditData(userId)
    };

    return this.itemRepository.create(transformedData);
  }

  /**
   * Atualiza um item
   */
  async update(id: string, data: UpdateItemDTO, userId: string): Promise<Item> {
    await this.validateUpdateData(data);

    // Verifica se o item existe
    const existingItem = await this.itemRepository.findById(id);
    if (!existingItem) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }

    // Verifica se já existe outro item com o mesmo nome
    if (data.nome && data.nome !== existingItem.nome) {
      const exists = await this.itemRepository.existsByNome(data.nome, id);
      if (exists) {
        throw CommonErrors.CONFLICT("Já existe um item com este nome");
      }
    }

    const transformedData = this.transformUpdateData(data, userId);

    return this.itemRepository.update(id, transformedData);
  }

  /**
   * Busca items com relacionamentos
   */
  async findAllWithRelations(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ) {
    const where: any = {};

    // Filtros
    if (filters.nome) {
      where.nome = {
        contains: filters.nome,
        mode: "insensitive",
      };
    }

    if (filters.unidade) {
      where.unidade = {
        equals: filters.unidade,
        mode: "insensitive",
      };
    }

    if (filters.ativo !== undefined) {
      where.ativo = filters.ativo;
    }

    return this.itemRepository.findAllWithRelations(page, limit, where);
  }

  /**
   * Busca item por ID com relacionamentos
   */
  async findByIdWithRelations(id: string) {
    const item = await this.itemRepository.findByIdWithRelations(id);
    if (!item) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }
    return item;
  }

  /**
   * Busca items por nome
   */
  async findByNome(nome: string, limit: number = 10) {
    if (!nome || nome.trim().length === 0) {
      throw CommonErrors.VALIDATION_ERROR("Nome é obrigatório para busca");
    }

    return this.itemRepository.findByNome(nome.trim(), limit);
  }

  /**
   * Busca items ativos para seleção
   */
  async findActiveForSelection() {
    return this.itemRepository.findActiveForSelection();
  }

  /**
   * Busca items por unidade
   */
  async findByUnidade(unidade: string) {
    if (!unidade || unidade.trim().length === 0) {
      throw CommonErrors.VALIDATION_ERROR("Unidade é obrigatória para busca");
    }

    return this.itemRepository.findByUnidade(unidade.trim());
  }

  /**
   * Busca items mais utilizados
   */
  async findMostUsed(limit: number = 10) {
    if (limit <= 0 || limit > 50) {
      throw CommonErrors.VALIDATION_ERROR("Limite deve estar entre 1 e 50");
    }

    return this.itemRepository.findMostUsed(limit);
  }

  /**
   * Busca unidades disponíveis
   */
  async findDistinctUnidades() {
    return this.itemRepository.findDistinctUnidades();
  }

  /**
   * Busca estatísticas de uso do item
   */
  async getItemStats(itemId: string) {
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }

    return this.itemRepository.getItemStats(itemId);
  }

  /**
   * Deleta um item
   */
  async delete(id: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }

    // Verifica se o item está sendo usado em entregas
    const entregaItems = await this.itemRepository.count({
      entregaItems: {
        some: { itemId: id }
      }
    });

    if (entregaItems > 0) {
      throw CommonErrors.CONFLICT("Não é possível excluir este item pois ele está sendo usado em entregas");
    }

    return this.itemRepository.update(id, { ativo: false });
  }

  /**
   * Reativa um item
   */
  async reactivate(id: string, userId: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }

    return this.itemRepository.update(id, { 
      ativo: true,
      ...this.addAuditData(userId)
    });
  }
}
