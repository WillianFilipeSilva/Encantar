"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    constructor(service) {
        this.service = service;
    }
    async findAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = this.buildFilters(req.query);
            const result = await this.service.findAll(page, limit, filters);
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "ID é obrigatório",
                    code: "MISSING_ID",
                });
                return;
            }
            const result = await this.service.findById(id);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const data = req.body;
            const userId = req.user?.id;
            const result = await this.service.create(data, userId);
            res.status(201).json({
                success: true,
                data: result,
                message: "Registro criado com sucesso",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const userId = req.user?.id;
            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "ID é obrigatório",
                    code: "MISSING_ID",
                });
                return;
            }
            const result = await this.service.update(id, data, userId);
            res.json({
                success: true,
                data: result,
                message: "Registro atualizado com sucesso",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "ID é obrigatório",
                    code: "MISSING_ID",
                });
                return;
            }
            await this.service.delete(id);
            res.json({
                success: true,
                message: "Registro removido com sucesso",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async hardDelete(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "ID é obrigatório",
                    code: "MISSING_ID",
                });
                return;
            }
            await this.service.hardDelete(id);
            res.json({
                success: true,
                message: "Registro removido permanentemente",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async count(req, res, next) {
        try {
            const filters = this.buildFilters(req.query);
            const total = await this.service.count(filters);
            res.json({
                success: true,
                data: { total },
            });
        }
        catch (error) {
            next(error);
        }
    }
    buildFilters(query) {
        const filters = {};
        if (query.ativo !== undefined) {
            filters.ativo = query.ativo === "true";
        }
        if (query.search) {
            filters.OR = [
                { nome: { contains: query.search, mode: "insensitive" } },
            ];
        }
        if (query.dataInicio) {
            filters.criadoEm = {
                ...filters.criadoEm,
                gte: new Date(query.dataInicio),
            };
        }
        if (query.dataFim) {
            filters.criadoEm = {
                ...filters.criadoEm,
                lte: new Date(query.dataFim),
            };
        }
        return filters;
    }
    async validatePermission(req, operation) {
        return true;
    }
    successResponse(res, data, message, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            data,
            message,
        });
    }
    errorResponse(res, error, code, statusCode = 400) {
        return res.status(statusCode).json({
            success: false,
            error,
            code,
        });
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map