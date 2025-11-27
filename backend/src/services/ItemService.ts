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

    const validUnidades = ['KG', 'G', 'L', 'ML', 'UN', 'CX', 'PCT', 'LATA'];
    if (!validUnidades.includes(data.unidade)) {
      throw CommonErrors.VALIDATION_ERROR("Unidade deve ser uma das opções válidas: " + validUnidades.join(', '));
    }

    if (data.descricao && data.descricao.length > 2000) {
      throw CommonErrors.VALIDATION_ERROR("Descrição deve ter no máximo 2000 caracteres");
    }
  }

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

      const validUnidades = ['KG', 'G', 'L', 'ML', 'UN', 'CX', 'PCT', 'LATA'];
      if (!validUnidades.includes(data.unidade)) {
        throw CommonErrors.VALIDATION_ERROR("Unidade deve ser uma das opções válidas: " + validUnidades.join(', '));
      }
    }

    if (
      data.descricao !== undefined &&
      data.descricao &&
      data.descricao.length > 2000
    ) {
      throw CommonErrors.VALIDATION_ERROR("Descrição deve ter no máximo 2000 caracteres");
    }
  }  /**
   * Transforma dados antes da criação
   */
  protected transformData(data: Item): any {
    return {
      nome: data.nome.trim(),
      unidade: data.unidade,
      descricao: data.descricao?.trim() || null
    };
  }

  /**
   * Transforma dados para atualização
   */
  protected async transformUpdateData(data: UpdateItemDTO, userId?: string): Promise<any> {
    const transformed: any = await this.addAuditData({}, userId, "update");

    if (data.nome !== undefined) {
      transformed.nome = data.nome.trim();
    }

    if (data.unidade !== undefined) {
      transformed.unidade = data.unidade;
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

    const exists = await this.itemRepository.existsByNome(data.nome);
    if (exists) {
      throw CommonErrors.CONFLICT("Já existe um item com este nome");
    }

    const auditData = await this.addAuditData({}, userId, "create");
    const transformedData = {
      ...this.transformData(data as any),
      ...auditData
    };

    return this.itemRepository.create(transformedData);
  }

  /**
   * Atualiza um item
   */
  async update(id: string, data: UpdateItemDTO, userId: string): Promise<Item> {
    await this.validateUpdateData(data);

    const existingItem = await this.itemRepository.findById(id);
    if (!existingItem) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }

    if (data.nome && data.nome !== existingItem.nome) {
      const exists = await this.itemRepository.existsByNome(data.nome, id);
      if (exists) {
        throw CommonErrors.CONFLICT("Já existe um item com este nome");
      }
    }

    const transformedData = await this.transformUpdateData(data, userId);

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

    // Extrai parâmetros de ordenação dos filtros
    const sortBy = filters?.sortBy;
    const sortOrder = filters?.sortOrder;

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

    return this.itemRepository.findAllWithRelations(page, limit, where, sortBy, sortOrder);
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
   * Busca itens para autocomplete
   */
  async search(searchTerm: string, activeOnly: boolean = true): Promise<Pick<Item, 'id' | 'nome' | 'unidade' | 'descricao'>[]> {
    if (!searchTerm || searchTerm.trim().length < 1) {
      return [];
    }

    return this.itemRepository.findByNome(searchTerm.trim(), 50);
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
   * Inativa um item
   */
  async inactivate(id: string, userId: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }

    if (!item.ativo) {
      throw CommonErrors.VALIDATION_ERROR("Item já está inativo");
    }

    const auditData = await this.addAuditData({}, userId, "update");
    return this.itemRepository.update(id, {
      ativo: false,
      ...auditData
    });
  }

  /**
   * Ativa um item
   */
  async activate(id: string, userId: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }

    if (item.ativo) {
      throw CommonErrors.VALIDATION_ERROR("Item já está ativo");
    }

    const auditData = await this.addAuditData({}, userId, "update");
    return this.itemRepository.update(id, {
      ativo: true,
      ...auditData
    });
  }

  /**
   * Deleta um item
   */
  async delete(id: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw CommonErrors.NOT_FOUND("Item não encontrado");
    }

    const atendimentoItems = await this.itemRepository.count({
      atendimentoItems: {
        some: { itemId: id }
      }
    });

    if (atendimentoItems > 0) {
      throw CommonErrors.CONFLICT("Não é possível excluir este item pois ele está sendo usado em atendimentos");
    }

    return this.itemRepository.hardDelete(id);
  }
}
