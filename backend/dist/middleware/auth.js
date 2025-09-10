"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.checkOwnership = exports.optionalAuth = exports.authenticateToken = void 0;
const AuthService_1 = require("../services/AuthService");
const database_1 = require("../utils/database");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: "Token de acesso necessário",
                code: "MISSING_TOKEN",
            });
            return;
        }
        const authService = new AuthService_1.AuthService(database_1.prisma);
        const payload = await authService.verifyToken(token);
        const user = await database_1.prisma.administrador.findUnique({
            where: { id: payload.id },
            select: {
                id: true,
                nome: true,
                login: true,
                ativo: true,
            },
        });
        if (!user || !user.ativo) {
            res.status(401).json({
                success: false,
                error: "Usuário não encontrado ou inativo",
                code: "USER_NOT_FOUND",
            });
            return;
        }
        req.user = {
            id: user.id,
            nome: user.nome,
            login: user.login,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: "Token inválido",
            code: "INVALID_TOKEN",
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (token) {
            const authService = new AuthService_1.AuthService(database_1.prisma);
            const payload = await authService.verifyToken(token);
            const user = await database_1.prisma.administrador.findUnique({
                where: { id: payload.id },
                select: {
                    id: true,
                    nome: true,
                    login: true,
                    ativo: true,
                },
            });
            if (user && user.ativo) {
                req.user = {
                    id: user.id,
                    nome: user.nome,
                    login: user.login,
                };
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const checkOwnership = (resourceIdParam = "id") => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: "Usuário não autenticado",
                    code: "NOT_AUTHENTICATED",
                });
                return;
            }
            const resourceId = req.params[resourceIdParam];
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.checkOwnership = checkOwnership;
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: "Usuário não autenticado",
                    code: "NOT_AUTHENTICATED",
                });
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requirePermission = requirePermission;
//# sourceMappingURL=auth.js.map