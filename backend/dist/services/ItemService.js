"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const BaseService_1 = require("./BaseService");
const errorHandler_1 = require("../middleware/errorHandler");
class ItemService extends BaseService_1.BaseService {
    constructor(itemRepository) {
        super(itemRepository);
        this.itemRepository = itemRepository;
    }
    async validateCreateData(data) {
        if (!data.nome || data.nome.trim().length === 0) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Nome é obrigatório");
        }
        if (data.nome.length > 100) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Nome deve ter no máximo 100 caracteres");
        }
        if (!data.unidade || data.unidade.trim().length === 0) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Unidade é obrigatória");
        }
        if (data.unidade.length > 20) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Unidade deve ter no máximo 20 caracteres");
        }
        if (data.descricao && data.descricao.length > 500) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Descrição deve ter no máximo 500 caracteres");
        }
    }
    async validateUpdateData(data) {
        if (data.nome !== undefined) {
            if (!data.nome || data.nome.trim().length === 0) {
                throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Nome é obrigatório");
            }
            if (data.nome.length > 100) {
                throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Nome deve ter no máximo 100 caracteres");
            }
        }
        if (data.unidade !== undefined) {
            if (!data.unidade || data.unidade.trim().length === 0) {
                throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Unidade é obrigatória");
            }
            if (data.unidade.length > 20) {
                throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Unidade deve ter no máximo 20 caracteres");
            }
        }
        if (data.descricao !== undefined &&
            data.descricao &&
            data.descricao.length > 500) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Descrição deve ter no máximo 500 caracteres");
        }
    }
    transformData(data) {
        return {
            nome: data.nome.trim(),
            unidade: data.unidade.trim(),
            descricao: data.descricao?.trim() || null,
            ativo: true
        };
    }
    transformUpdateData(data, userId) {
        const transformed = this.addAuditData(userId);
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
    async create(data, userId) {
        await this.validateCreateData(data);
        const exists = await this.itemRepository.existsByNome(data.nome);
        if (exists) {
            throw errorHandler_1.CommonErrors.CONFLICT("Já existe um item com este nome");
        }
        const transformedData = {
            ...this.transformData(data),
            ...this.addAuditData(userId)
        };
        return this.itemRepository.create(transformedData);
    }
    async update(id, data, userId) {
        await this.validateUpdateData(data);
        const existingItem = await this.itemRepository.findById(id);
        if (!existingItem) {
            throw errorHandler_1.CommonErrors.NOT_FOUND("Item não encontrado");
        }
        if (data.nome && data.nome !== existingItem.nome) {
            const exists = await this.itemRepository.existsByNome(data.nome, id);
            if (exists) {
                throw errorHandler_1.CommonErrors.CONFLICT("Já existe um item com este nome");
            }
        }
        const transformedData = this.transformUpdateData(data, userId);
        return this.itemRepository.update(id, transformedData);
    }
    async findAllWithRelations(page = 1, limit = 10, filters = {}) {
        const where = {};
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
    async findByIdWithRelations(id) {
        const item = await this.itemRepository.findByIdWithRelations(id);
        if (!item) {
            throw errorHandler_1.CommonErrors.NOT_FOUND("Item não encontrado");
        }
        return item;
    }
    async findByNome(nome, limit = 10) {
        if (!nome || nome.trim().length === 0) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Nome é obrigatório para busca");
        }
        return this.itemRepository.findByNome(nome.trim(), limit);
    }
    async findActiveForSelection() {
        return this.itemRepository.findActiveForSelection();
    }
    async findByUnidade(unidade) {
        if (!unidade || unidade.trim().length === 0) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Unidade é obrigatória para busca");
        }
        return this.itemRepository.findByUnidade(unidade.trim());
    }
    async findMostUsed(limit = 10) {
        if (limit <= 0 || limit > 50) {
            throw errorHandler_1.CommonErrors.VALIDATION_ERROR("Limite deve estar entre 1 e 50");
        }
        return this.itemRepository.findMostUsed(limit);
    }
    async findDistinctUnidades() {
        return this.itemRepository.findDistinctUnidades();
    }
    async getItemStats(itemId) {
        const item = await this.itemRepository.findById(itemId);
        if (!item) {
            throw errorHandler_1.CommonErrors.NOT_FOUND("Item não encontrado");
        }
        return this.itemRepository.getItemStats(itemId);
    }
    async delete(id) {
        const item = await this.itemRepository.findById(id);
        if (!item) {
            throw errorHandler_1.CommonErrors.NOT_FOUND("Item não encontrado");
        }
        const entregaItems = await this.itemRepository.count({
            entregaItems: {
                some: { itemId: id }
            }
        });
        if (entregaItems > 0) {
            throw errorHandler_1.CommonErrors.CONFLICT("Não é possível excluir este item pois ele está sendo usado em entregas");
        }
        return this.itemRepository.update(id, { ativo: false });
    }
    async reactivate(id, userId) {
        const item = await this.itemRepository.findById(id);
        if (!item) {
            throw errorHandler_1.CommonErrors.NOT_FOUND("Item não encontrado");
        }
        return this.itemRepository.update(id, {
            ativo: true,
            ...this.addAuditData(userId)
        });
    }
}
exports.ItemService = ItemService;
//# sourceMappingURL=ItemService.js.map