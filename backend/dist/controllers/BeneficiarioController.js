"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeneficiarioController = void 0;
const BaseController_1 = require("./BaseController");
const errorHandler_1 = require("../middleware/errorHandler");
const express_validator_1 = require("express-validator");
class BeneficiarioController extends BaseController_1.BaseController {
    constructor(beneficiarioService) {
        super(beneficiarioService);
        this.findAll = async (req, res, next) => {
            try {
                await (0, express_validator_1.query)("page")
                    .optional()
                    .isInt({ min: 1 })
                    .withMessage("Página deve ser um número positivo")
                    .run(req);
                await (0, express_validator_1.query)("limit")
                    .optional()
                    .isInt({ min: 1, max: 100 })
                    .withMessage("Limit deve ser entre 1 e 100")
                    .run(req);
                await (0, express_validator_1.query)("search")
                    .optional()
                    .isLength({ min: 2 })
                    .withMessage("Busca deve ter pelo menos 2 caracteres")
                    .run(req);
                await (0, express_validator_1.query)("ativo")
                    .optional()
                    .isBoolean()
                    .withMessage("Ativo deve ser true ou false")
                    .run(req);
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw errorHandler_1.CommonErrors.VALIDATION_ERROR(`Parâmetros inválidos: ${errors.array()[0].msg}`);
                }
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const filters = this.buildFilters(req.query);
                const result = await this.beneficiarioService.findAllWithRelations(page, limit, filters);
                res.json({
                    success: true,
                    data: result.data,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.findById = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw errorHandler_1.CommonErrors.BAD_REQUEST("ID é obrigatório");
                }
                const result = await this.beneficiarioService.findByIdWithRelations(id);
                res.json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                await (0, express_validator_1.body)("nome")
                    .notEmpty()
                    .withMessage("Nome é obrigatório")
                    .isLength({ min: 2, max: 100 })
                    .withMessage("Nome deve ter entre 2 e 100 caracteres")
                    .run(req);
                await (0, express_validator_1.body)("endereco")
                    .notEmpty()
                    .withMessage("Endereço é obrigatório")
                    .isLength({ min: 5, max: 200 })
                    .withMessage("Endereço deve ter entre 5 e 200 caracteres")
                    .run(req);
                await (0, express_validator_1.body)("telefone")
                    .optional()
                    .isLength({ min: 10, max: 15 })
                    .withMessage("Telefone deve ter entre 10 e 15 caracteres")
                    .run(req);
                await (0, express_validator_1.body)("email")
                    .optional()
                    .isEmail()
                    .withMessage("Email inválido")
                    .run(req);
                await (0, express_validator_1.body)("observacoes")
                    .optional()
                    .isLength({ max: 500 })
                    .withMessage("Observações deve ter no máximo 500 caracteres")
                    .run(req);
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw errorHandler_1.CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
                }
                const data = req.body;
                const userId = req.user?.id;
                const result = await this.beneficiarioService.create(data, userId);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: "Beneficiário criado com sucesso",
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw errorHandler_1.CommonErrors.BAD_REQUEST("ID é obrigatório");
                }
                await (0, express_validator_1.body)("nome")
                    .optional()
                    .isLength({ min: 2, max: 100 })
                    .withMessage("Nome deve ter entre 2 e 100 caracteres")
                    .run(req);
                await (0, express_validator_1.body)("endereco")
                    .optional()
                    .isLength({ min: 5, max: 200 })
                    .withMessage("Endereço deve ter entre 5 e 200 caracteres")
                    .run(req);
                await (0, express_validator_1.body)("telefone")
                    .optional()
                    .isLength({ min: 10, max: 15 })
                    .withMessage("Telefone deve ter entre 10 e 15 caracteres")
                    .run(req);
                await (0, express_validator_1.body)("email")
                    .optional()
                    .isEmail()
                    .withMessage("Email inválido")
                    .run(req);
                await (0, express_validator_1.body)("observacoes")
                    .optional()
                    .isLength({ max: 500 })
                    .withMessage("Observações deve ter no máximo 500 caracteres")
                    .run(req);
                await (0, express_validator_1.body)("ativo")
                    .optional()
                    .isBoolean()
                    .withMessage("Ativo deve ser true ou false")
                    .run(req);
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw errorHandler_1.CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
                }
                const data = req.body;
                const userId = req.user?.id;
                const result = await this.beneficiarioService.update(id, data, userId);
                res.json({
                    success: true,
                    data: result,
                    message: "Beneficiário atualizado com sucesso",
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw errorHandler_1.CommonErrors.BAD_REQUEST("ID é obrigatório");
                }
                await this.beneficiarioService.delete(id);
                res.json({
                    success: true,
                    message: "Beneficiário removido com sucesso",
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.search = async (req, res, next) => {
            try {
                await (0, express_validator_1.query)("q")
                    .notEmpty()
                    .withMessage("Parâmetro de busca é obrigatório")
                    .isLength({ min: 2 })
                    .withMessage("Busca deve ter pelo menos 2 caracteres")
                    .run(req);
                await (0, express_validator_1.query)("limit")
                    .optional()
                    .isInt({ min: 1, max: 50 })
                    .withMessage("Limit deve ser entre 1 e 50")
                    .run(req);
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw errorHandler_1.CommonErrors.VALIDATION_ERROR(`Parâmetros inválidos: ${errors.array()[0].msg}`);
                }
                const { q } = req.query;
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.beneficiarioService.findByNome(q, limit);
                res.json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.findActive = async (req, res, next) => {
            try {
                const result = await this.beneficiarioService.findActiveForSelection();
                res.json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.findTop = async (req, res, next) => {
            try {
                await (0, express_validator_1.query)("limit")
                    .optional()
                    .isInt({ min: 1, max: 50 })
                    .withMessage("Limit deve ser entre 1 e 50")
                    .run(req);
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw errorHandler_1.CommonErrors.VALIDATION_ERROR(`Parâmetros inválidos: ${errors.array()[0].msg}`);
                }
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.beneficiarioService.findTopBeneficiarios(limit);
                res.json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.beneficiarioService = beneficiarioService;
    }
    buildFilters(query) {
        const filters = {};
        if (query.ativo !== undefined) {
            filters.ativo = query.ativo === "true";
        }
        if (query.search) {
            filters.OR = [
                { nome: { contains: query.search, mode: "insensitive" } },
                { endereco: { contains: query.search, mode: "insensitive" } },
                { telefone: { contains: query.search, mode: "insensitive" } },
                { email: { contains: query.search, mode: "insensitive" } },
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
}
exports.BeneficiarioController = BeneficiarioController;
//# sourceMappingURL=BeneficiarioController.js.map