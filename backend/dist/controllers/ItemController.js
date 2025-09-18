"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const BaseController_1 = require("./BaseController");
const express_validator_1 = require("express-validator");
class ItemController extends BaseController_1.BaseController {
    constructor(itemService) {
        super(itemService);
        this.validateCreate = [
            (0, express_validator_1.body)("nome")
                .notEmpty()
                .withMessage("Nome é obrigatório")
                .isLength({ max: 100 })
                .withMessage("Nome deve ter no máximo 100 caracteres")
                .trim(),
            (0, express_validator_1.body)("unidade")
                .notEmpty()
                .withMessage("Unidade é obrigatória")
                .isLength({ max: 20 })
                .withMessage("Unidade deve ter no máximo 20 caracteres")
                .trim(),
            (0, express_validator_1.body)("descricao")
                .optional()
                .isLength({ max: 500 })
                .withMessage("Descrição deve ter no máximo 500 caracteres")
                .trim(),
            (0, express_validator_1.body)("ativo")
                .optional()
                .isBoolean()
                .withMessage("Ativo deve ser um valor booleano"),
        ];
        this.validateUpdate = [
            (0, express_validator_1.param)("id").isUUID().withMessage("ID deve ser um UUID válido"),
            (0, express_validator_1.body)("nome")
                .optional()
                .notEmpty()
                .withMessage("Nome não pode estar vazio")
                .isLength({ max: 100 })
                .withMessage("Nome deve ter no máximo 100 caracteres")
                .trim(),
            (0, express_validator_1.body)("unidade")
                .optional()
                .notEmpty()
                .withMessage("Unidade não pode estar vazia")
                .isLength({ max: 20 })
                .withMessage("Unidade deve ter no máximo 20 caracteres")
                .trim(),
            (0, express_validator_1.body)("descricao")
                .optional()
                .isLength({ max: 500 })
                .withMessage("Descrição deve ter no máximo 500 caracteres")
                .trim(),
            (0, express_validator_1.body)("ativo")
                .optional()
                .isBoolean()
                .withMessage("Ativo deve ser um valor booleano"),
        ];
        this.validateSearch = [
            (0, express_validator_1.query)("page")
                .optional()
                .isInt({ min: 1 })
                .withMessage("Página deve ser um número inteiro maior que 0"),
            (0, express_validator_1.query)("limit")
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage("Limite deve ser um número entre 1 e 100"),
            (0, express_validator_1.query)("nome")
                .optional()
                .isLength({ max: 100 })
                .withMessage("Nome de busca deve ter no máximo 100 caracteres")
                .trim(),
            (0, express_validator_1.query)("unidade")
                .optional()
                .isLength({ max: 20 })
                .withMessage("Unidade de busca deve ter no máximo 20 caracteres")
                .trim(),
            (0, express_validator_1.query)("ativo")
                .optional()
                .isBoolean()
                .withMessage("Ativo deve ser um valor booleano"),
        ];
        this.validateId = [
            (0, express_validator_1.param)("id").isUUID().withMessage("ID deve ser um UUID válido"),
        ];
        this.validateSearchByName = [
            (0, express_validator_1.query)("nome")
                .notEmpty()
                .withMessage("Nome é obrigatório para busca")
                .isLength({ max: 100 })
                .withMessage("Nome deve ter no máximo 100 caracteres")
                .trim(),
            (0, express_validator_1.query)("limit")
                .optional()
                .isInt({ min: 1, max: 50 })
                .withMessage("Limite deve ser um número entre 1 e 50"),
        ];
        this.validateSearchByUnidade = [
            (0, express_validator_1.query)("unidade")
                .notEmpty()
                .withMessage("Unidade é obrigatória para busca")
                .isLength({ max: 20 })
                .withMessage("Unidade deve ter no máximo 20 caracteres")
                .trim(),
        ];
        this.validateLimit = [
            (0, express_validator_1.query)("limit")
                .optional()
                .isInt({ min: 1, max: 50 })
                .withMessage("Limite deve ser um número entre 1 e 50"),
        ];
        this.itemService = itemService;
    }
    async findAll(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            await super.findAll(req, res, next);
        }
        catch (error) {
            next(error);
        }
    }
    async findById(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            await super.findById(req, res, next);
        }
        catch (error) {
            next(error);
        }
    }
    async findAllWithRelations(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = this.buildFilters(req.query);
            const result = await this.itemService.findAllWithRelations(page, limit, filters);
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findByIdWithRelations(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const { id } = req.params;
            const item = await this.itemService.findByIdWithRelations(id);
            this.successResponse(res, item);
        }
        catch (error) {
            next(error);
        }
    }
    async findByNome(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const { nome } = req.query;
            const limit = parseInt(req.query.limit) || 10;
            const items = await this.itemService.findByNome(nome, limit);
            this.successResponse(res, items);
        }
        catch (error) {
            next(error);
        }
    }
    async findActiveForSelection(req, res, next) {
        try {
            const items = await this.itemService.findActiveForSelection();
            this.successResponse(res, items);
        }
        catch (error) {
            next(error);
        }
    }
    async findByUnidade(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const { unidade } = req.query;
            const items = await this.itemService.findByUnidade(unidade);
            this.successResponse(res, items);
        }
        catch (error) {
            next(error);
        }
    }
    async findMostUsed(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const limit = parseInt(req.query.limit) || 10;
            const items = await this.itemService.findMostUsed(limit);
            this.successResponse(res, items);
        }
        catch (error) {
            next(error);
        }
    }
    async findDistinctUnidades(req, res, next) {
        try {
            const unidades = await this.itemService.findDistinctUnidades();
            this.successResponse(res, unidades);
        }
        catch (error) {
            next(error);
        }
    }
    async getItemStats(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const { id } = req.params;
            const stats = await this.itemService.getItemStats(id);
            this.successResponse(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async reactivate(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            const { id } = req.params;
            const userId = req.user?.id;
            const item = await this.itemService.reactivate(id, userId);
            this.successResponse(res, item, "Item reativado com sucesso");
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            await super.create(req, res, next);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            await super.update(req, res, next);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
                return;
            }
            await super.delete(req, res, next);
        }
        catch (error) {
            next(error);
        }
    }
    buildFilters(query) {
        const filters = super.buildFilters(query);
        if (query.nome) {
            filters.nome = {
                contains: query.nome,
                mode: "insensitive"
            };
        }
        if (query.unidade) {
            filters.unidade = {
                equals: query.unidade,
                mode: "insensitive"
            };
        }
        return filters;
    }
    getValidations() {
        return {
            validateCreate: this.validateCreate,
            validateUpdate: this.validateUpdate,
            validateSearch: this.validateSearch,
            validateId: this.validateId,
            validateSearchByName: this.validateSearchByName,
            validateSearchByUnidade: this.validateSearchByUnidade,
            validateLimit: this.validateLimit,
        };
    }
}
exports.ItemController = ItemController;
//# sourceMappingURL=ItemController.js.map