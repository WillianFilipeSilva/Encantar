"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const database_1 = require("../utils/database");
const errorHandler_1 = require("../middleware/errorHandler");
const express_validator_1 = require("express-validator");
class AuthController {
    constructor() {
        this.login = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            await (0, express_validator_1.body)("login")
                .notEmpty()
                .withMessage("Login é obrigatório")
                .run(req);
            await (0, express_validator_1.body)("senha")
                .isLength({ min: 6 })
                .withMessage("Senha deve ter pelo menos 6 caracteres")
                .run(req);
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: "Dados inválidos",
                    code: "VALIDATION_ERROR",
                    details: errors.array(),
                });
                return;
                return;
            }
            const loginData = req.body;
            const result = await this.authService.login(loginData);
            res.json({
                success: true,
                data: result,
                message: "Login realizado com sucesso",
            });
        });
        this.register = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            await (0, express_validator_1.body)("nome").notEmpty().withMessage("Nome é obrigatório").run(req);
            await (0, express_validator_1.body)("login")
                .isLength({ min: 3 })
                .withMessage("Login deve ter pelo menos 3 caracteres")
                .run(req);
            await (0, express_validator_1.body)("senha")
                .isLength({ min: 6 })
                .withMessage("Senha deve ter pelo menos 6 caracteres")
                .run(req);
            await (0, express_validator_1.body)("token")
                .notEmpty()
                .withMessage("Token do convite é obrigatório")
                .run(req);
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: "Dados inválidos",
                    code: "VALIDATION_ERROR",
                    details: errors.array(),
                });
                return;
            }
            const registerData = req.body;
            const result = await this.authService.register(registerData);
            res.status(201).json({
                success: true,
                data: result,
                message: "Usuário registrado com sucesso",
            });
        });
        this.refresh = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    error: "Refresh token é obrigatório",
                    code: "MISSING_REFRESH_TOKEN",
                });
                return;
            }
            const result = await this.authService.refreshToken(refreshToken);
            res.json({
                success: true,
                data: result,
                message: "Token renovado com sucesso",
            });
        });
        this.createInvite = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            await (0, express_validator_1.body)("email")
                .optional()
                .isEmail()
                .withMessage("Email inválido")
                .run(req);
            await (0, express_validator_1.body)("telefone")
                .optional()
                .isMobilePhone("pt-BR")
                .withMessage("Telefone inválido")
                .run(req);
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: "Dados inválidos",
                    code: "VALIDATION_ERROR",
                    details: errors.array(),
                });
                return;
            }
            const inviteData = req.body;
            const result = await this.authService.createInvite(inviteData, req.user.id);
            res.status(201).json({
                success: true,
                data: result,
                message: "Convite criado com sucesso",
            });
        });
        this.me = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const user = await database_1.prisma.administrador.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    nome: true,
                    login: true,
                    ativo: true,
                    criadoEm: true,
                    atualizadoEm: true,
                },
            });
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "Usuário não encontrado",
                    code: "USER_NOT_FOUND",
                });
                return;
            }
            res.json({
                success: true,
                data: user,
            });
        });
        this.logout = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            res.json({
                success: true,
                message: "Logout realizado com sucesso",
            });
        });
        this.validateInvite = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { token } = req.params;
            if (!token) {
                res.status(400).json({
                    success: false,
                    error: "Token é obrigatório",
                    code: "MISSING_TOKEN",
                });
                return;
            }
            try {
                const convite = await database_1.prisma.convite.findUnique({
                    where: { token },
                    include: { enviadoPor: { select: { nome: true } } },
                });
                if (!convite) {
                    res.status(404).json({
                        success: false,
                        error: "Convite não encontrado",
                        code: "INVITE_NOT_FOUND",
                    });
                    return;
                }
                if (convite.usado) {
                    res.status(400).json({
                        success: false,
                        error: "Convite já foi utilizado",
                        code: "INVITE_USED",
                    });
                    return;
                }
                if (convite.expiraEm < new Date()) {
                    res.status(400).json({
                        success: false,
                        error: "Convite expirado",
                        code: "INVITE_EXPIRED",
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: {
                        email: convite.email,
                        telefone: convite.telefone,
                        enviadoPor: convite.enviadoPor.nome,
                        expiraEm: convite.expiraEm,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.authService = new AuthService_1.AuthService(database_1.prisma);
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map