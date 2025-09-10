"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
class BaseService {
    constructor(repository) {
        this.repository = repository;
    }
    async findAll(page = 1, limit = 10, filters) {
        if (page < 1)
            page = 1;
        if (limit < 1 || limit > 100)
            limit = 10;
        return this.repository.findAll(page, limit, filters);
    }
    async findById(id) {
        if (!id) {
            throw new Error("ID é obrigatório");
        }
        const result = await this.repository.findById(id);
        if (!result) {
            throw new Error("Registro não encontrado");
        }
        return result;
    }
    async create(data, userId) {
        await this.validateCreateData(data);
        const createData = this.addAuditData(data, userId, "create");
        return this.repository.create(createData);
    }
    async update(id, data, userId) {
        if (!id) {
            throw new Error("ID é obrigatório");
        }
        await this.findById(id);
        await this.validateUpdateData(data);
        const updateData = this.addAuditData(data, userId, "update");
        return this.repository.update(id, updateData);
    }
    async delete(id) {
        if (!id) {
            throw new Error("ID é obrigatório");
        }
        await this.findById(id);
        return this.repository.delete(id);
    }
    async hardDelete(id) {
        if (!id) {
            throw new Error("ID é obrigatório");
        }
        await this.findById(id);
        return this.repository.hardDelete(id);
    }
    async findByCriteria(criteria, include) {
        return this.repository.findMany(criteria, undefined, include);
    }
    async count(criteria) {
        return this.repository.count(criteria);
    }
    async exists(criteria) {
        return this.repository.exists(criteria);
    }
    async validateCreateData(data) {
    }
    async validateUpdateData(data) {
    }
    addAuditData(data, userId, operation = "create") {
        if (!userId)
            return data;
        const auditData = { ...data };
        if (operation === "create") {
            auditData.criadoPorId = userId;
        }
        else if (operation === "update") {
            auditData.modificadoPorId = userId;
        }
        return auditData;
    }
    transformData(data) {
        return data;
    }
    transformListData(data) {
        return data.map((item) => this.transformData(item));
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map