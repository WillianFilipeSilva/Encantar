import { Request } from "express";

/**
 * Interface para dados de login
 */
export interface LoginData {
  login: string;
  senha: string;
}

/**
 * Interface para dados de registro via convite
 */
export interface RegisterData {
  nome: string;
  login: string;
  senha: string;
  token: string;
}

/**
 * Interface para payload do JWT
 */
export interface JWTPayload {
  id: string;
  login: string;
  nome: string;
  iat?: number;
  exp?: number;
}

/**
 * Interface para resposta de autenticação
 */
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

/**
 * Interface para dados de convite
 */
export interface InviteData {
  email?: string;
  telefone?: string;
}

/**
 * Interface para Request com usuário autenticado
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    login: string;
    nome: string;
  };
}

/**
 * Interface para configuração JWT
 */
export interface JWTConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

