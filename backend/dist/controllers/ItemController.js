"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const BaseController_1 = require("./BaseController");
const errorHandler_1 = require("../middleware/errorHandler");
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
            (0, express_validator_1.param)("id")
                .isUUID()
                .withMessage("ID deve ser um UUID válido"),
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
            (0, express_validator_1.param)("id")
                .isUUID()
                .withMessage("ID deve ser um UUID válido"),
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
        this.findAll = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = this.buildFilters(req.query);
            const result = await this.itemService.findAll(page, limit, filters);
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        });
        this.findById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const { id } = req.params;
            const item = await this.itemService.findById(id);
            res.json({
                success: true,
                data: item,
            });
        });
        this.findAllWithRelations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = this.buildFilters(req.query);
            const result = await this.itemService.findAllWithRelations(page, limit, filters);
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        });
        this.findByIdWithRelations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const { id } = req.params;
            const item = await this.itemService.findByIdWithRelations(id);
            res.json({
                success: true,
                data: item,
            });
        });
        this.findByNome = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const { nome } = req.query;
            const limit = parseInt(req.query.limit) || 10;
            const items = await this.itemService.findByNome(nome, limit);
            res.json({
                success: true,
                data: items,
            });
        });
        this.findActiveForSelection = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const items = await this.itemService.findActiveForSelection();
            res.json({
                success: true,
                data: items,
            });
        });
        this.findByUnidade = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const { unidade } = req.query;
            const items = await this.itemService.findByUnidade(unidade);
            res.json({
                success: true,
                data: items,
            });
        });
        this.findMostUsed = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const limit = parseInt(req.query.limit) || 10;
            const items = await this.itemService.findMostUsed(limit);
            res.json({
                success: true,
                data: items,
            });
        });
        this.findDistinctUnidades = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const unidades = await this.itemService.findDistinctUnidades();
            res.json({
                success: true,
                data: unidades,
            });
        });
        this.getItemStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const { id } = req.params;
            const stats = await this.itemService.getItemStats(id);
            res.json({
                success: true,
                data: stats,
            });
        });
        this.reactivate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const { id } = req.params;
            const item = await this.itemService.reactivate(id, req.user.id);
            res.json({
                success: true,
                message: "Item reativado com sucesso",
                data: item,
            });
        });
        this.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const itemData = req.body;
            const item = await this.itemService.create(itemData, req.user.id);
            res.status(201).json({
                success: true,
                message: "Item criado com sucesso",
                data: item,
            });
        });
        this.update = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const { id } = req.params;
            const itemData = req.body;
            const item = await this.itemService.update(id, itemData, req.user.id);
            res.json({
                success: true,
                message: "Item atualizado com sucesso",
                data: item,
            });
        });
        this.delete = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: errors.array(),
                });
            }
            const { id } = req.params;
            await this.itemService.delete(id, req.user.id);
            res.json({
                success: true,
                message: "Item excluído com sucesso",
            });
        });
        this.itemService = itemService;
    }
    buildFilters(query) {
        const filters = {};
        if (query.nome) {
            filters.nome = query.nome;
        }
        if (query.unidade) {
            filters.unidade = query.unidade;
        }
        if (query.ativo !== undefined) {
            filters.ativo = query.ativo === "true";
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