"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middleware/errorHandler");
const crypto_1 = require("crypto");
class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
        this.jwtConfig = {
            secret: process.env.JWT_SECRET || "fallback-secret",
            refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
            expiresIn: process.env.JWT_EXPIRES_IN || "15m",
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        };
    }
    async login(loginData) {
        const { login, senha } = loginData;
        const administrador = await this.prisma.administrador.findUnique({
            where: { login },
        });
        if (!administrador) {
            throw errorHandler_1.CommonErrors.UNAUTHORIZED("Login ou senha inválidos");
        }
        if (!administrador.ativo) {
            throw errorHandler_1.CommonErrors.UNAUTHORIZED("Conta desativada");
        }
        const senhaValida = await bcryptjs_1.default.compare(senha, administrador.senha);
        if (!senhaValida) {
            throw errorHandler_1.CommonErrors.UNAUTHORIZED("Login ou senha inválidos");
        }
        const tokens = this.generateTokens({
            id: administrador.id,
            login: administrador.login,
            nome: administrador.nome,
        });
        return {
            user: {
                id: administrador.id,
                nome: administrador.nome,
                login: administrador.login,
            },
            ...tokens,
        };
    }
    async register(registerData) {
        const { nome, login, senha, token } = registerData;
        const convite = await this.validateInvite(token);
        const loginExiste = await this.prisma.administrador.findUnique({
            where: { login },
        });
        if (loginExiste) {
            throw errorHandler_1.CommonErrors.CONFLICT("Login já está em uso");
        }
        const senhaHash = await bcryptjs_1.default.hash(senha, 12);
        const administrador = await this.prisma.administrador.create({
            data: {
                nome,
                login,
                senha: senhaHash,
            },
        });
        await this.prisma.convite.update({
            where: { id: convite.id },
            data: { usado: true, usadoEm: new Date() },
        });
        const tokens = this.generateTokens({
            id: administrador.id,
            login: administrador.login,
            nome: administrador.nome,
        });
        return {
            user: {
                id: administrador.id,
                nome: administrador.nome,
                login: administrador.login,
            },
            ...tokens,
        };
    }
    async createInvite(inviteData, enviadoPorId) {
        const { email, telefone } = inviteData;
        if (!email && !telefone) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Email ou telefone é obrigatório");
        }
        const token = (0, crypto_1.randomBytes)(32).toString("hex");
        const expiraEm = new Date();
        expiraEm.setMinutes(expiraEm.getMinutes() + 15);
        const convite = await this.prisma.convite.create({
            data: {
                email,
                telefone,
                token,
                expiraEm,
                enviadoPorId,
            },
        });
        return {
            token: convite.token,
            expiraEm: convite.expiraEm,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = jsonwebtoken_1.default.verify(refreshToken, this.jwtConfig.refreshSecret);
            const administrador = await this.prisma.administrador.findUnique({
                where: { id: payload.id },
            });
            if (!administrador || !administrador.ativo) {
                throw errorHandler_1.CommonErrors.UNAUTHORIZED("Token inválido");
            }
            const accessToken = jsonwebtoken_1.default.sign({
                id: administrador.id,
                login: administrador.login,
                nome: administrador.nome,
            }, this.jwtConfig.secret, { expiresIn: this.jwtConfig.expiresIn });
            return {
                accessToken,
                expiresIn: this.parseExpiresIn(this.jwtConfig.expiresIn),
            };
        }
        catch (error) {
            throw errorHandler_1.CommonErrors.UNAUTHORIZED("Token inválido");
        }
    }
    async validateInvite(token) {
        const convite = await this.prisma.convite.findUnique({
            where: { token },
            include: { enviadoPor: true },
        });
        if (!convite) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Convite inválido");
        }
        if (convite.usado) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Convite já foi utilizado");
        }
        if (convite.expiraEm < new Date()) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Convite expirado");
        }
        return convite;
    }
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, this.jwtConfig.secret, {
            expiresIn: this.jwtConfig.expiresIn,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.jwtConfig.refreshSecret, {
            expiresIn: this.jwtConfig.refreshExpiresIn,
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.parseExpiresIn(this.jwtConfig.expiresIn),
        };
    }
    parseExpiresIn(expiresIn) {
        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1));
        switch (unit) {
            case "s":
                return value;
            case "m":
                return value * 60;
            case "h":
                return value * 60 * 60;
            case "d":
                return value * 60 * 60 * 24;
            default:
                return 15 * 60;
        }
    }
    async verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtConfig.secret);
        }
        catch (error) {
            throw errorHandler_1.CommonErrors.UNAUTHORIZED("Token inválido");
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map