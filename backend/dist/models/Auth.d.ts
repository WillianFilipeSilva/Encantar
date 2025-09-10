import { Request } from "express";
export interface LoginData {
    login: string;
    senha: string;
}
export interface RegisterData {
    nome: string;
    login: string;
    senha: string;
    token: string;
}
export interface JWTPayload {
    id: string;
    login: string;
    nome: string;
    iat?: number;
    exp?: number;
}
export interface AuthResponse {
    user: {
        id: string;
        nome: string;
        login: string;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface InviteData {
    email?: string;
    telefone?: string;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        login: string;
        nome: string;
    };
}
export interface JWTConfig {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
}
//# sourceMappingURL=Auth.d.ts.map