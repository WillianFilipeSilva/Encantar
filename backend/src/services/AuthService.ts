import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  LoginData,
  RegisterData,
  AuthResponse,
  InviteData,
  JWTPayload,
  JWTConfig,
} from "../models/Auth";
import { CommonErrors } from "../middleware/errorHandler";
import { randomBytes } from "crypto";

export class AuthService {
  private prisma: PrismaClient;
  private jwtConfig: JWTConfig;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.jwtConfig = {
      secret: process.env.JWT_SECRET || "fallback-secret",
      refreshSecret:
        process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    };
  }

  /**
   * Autentica um usuário
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    const { login, senha } = loginData;

    // Busca o administrador
    const administrador = await this.prisma.administrador.findUnique({
      where: { login },
    });

    if (!administrador) {
      throw CommonErrors.UNAUTHORIZED("Login ou senha inválidos");
    }

    if (!administrador.ativo) {
      throw CommonErrors.UNAUTHORIZED("Conta desativada");
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, administrador.senha);
    if (!senhaValida) {
      throw CommonErrors.UNAUTHORIZED("Login ou senha inválidos");
    }

    // Gera os tokens
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

  /**
   * Registra um novo administrador via convite
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    const { nome, login, senha, token } = registerData;

    // Valida o convite
    const convite = await this.validateInvite(token);

    // Verifica se o login já existe
    const loginExiste = await this.prisma.administrador.findUnique({
      where: { login },
    });

    if (loginExiste) {
      throw CommonErrors.CONFLICT("Login já está em uso");
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Cria o administrador
    const administrador = await this.prisma.administrador.create({
      data: {
        nome,
        login,
        senha: senhaHash,
        criadoPorId: convite.enviadoPorId,
      },
    });

    // Marca o convite como usado
    await this.prisma.convite.update({
      where: { id: convite.id },
      data: {
        usado: true,
        usadoEm: new Date(),
      },
    });

    // Gera os tokens
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

  /**
   * Cria um convite para novo administrador
   */
  async createInvite(
    inviteData: InviteData,
    enviadoPorId: string
  ): Promise<{ token: string; expiraEm: Date }> {
    const { email, telefone } = inviteData;

    if (!email && !telefone) {
      throw CommonErrors.BAD_REQUEST("Email ou telefone é obrigatório");
    }

    // Gera token único
    const token = randomBytes(32).toString("hex");

    // Define expiração (15 minutos)
    const expiraEm = new Date();
    expiraEm.setMinutes(expiraEm.getMinutes() + 15);

    // Cria o convite
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

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Verifica o refresh token
      const payload = jwt.verify(
        refreshToken,
        this.jwtConfig.refreshSecret
      ) as JWTPayload;

      // Busca o administrador
      const administrador = await this.prisma.administrador.findUnique({
        where: { id: payload.id },
      });

      if (!administrador || !administrador.ativo) {
        throw CommonErrors.UNAUTHORIZED("Token inválido");
      }

      // Gera novo access token
      const accessToken = jwt.sign(
        {
          id: administrador.id,
          login: administrador.login,
          nome: administrador.nome,
        },
        this.jwtConfig.secret,
        { expiresIn: this.jwtConfig.expiresIn } as jwt.SignOptions
      );

      return {
        accessToken,
        expiresIn: this.parseExpiresIn(this.jwtConfig.expiresIn),
      };
    } catch (error) {
      throw CommonErrors.UNAUTHORIZED("Token inválido");
    }
  }

  /**
   * Valida um token de convite
   */
  private async validateInvite(token: string) {
    const convite = await this.prisma.convite.findUnique({
      where: { token },
      include: { enviadoPor: true },
    });

    if (!convite) {
      throw CommonErrors.BAD_REQUEST("Convite inválido");
    }

    if (convite.usado) {
      throw CommonErrors.BAD_REQUEST("Convite já foi utilizado");
    }

    if (convite.expiraEm < new Date()) {
      throw CommonErrors.BAD_REQUEST("Convite expirado");
    }

    return convite;
  }

  /**
   * Gera access token e refresh token
   */
  private generateTokens(payload: Omit<JWTPayload, "iat" | "exp">) {
    const accessToken = jwt.sign(payload, this.jwtConfig.secret, {
      expiresIn: this.jwtConfig.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.jwtConfig.refreshSecret, {
      expiresIn: this.jwtConfig.refreshExpiresIn,
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(this.jwtConfig.expiresIn),
    };
  }

  /**
   * Converte string de expiração em segundos
   */
  private parseExpiresIn(expiresIn: string): number {
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
        return 15 * 60; // 15 minutos padrão
    }
  }

  /**
   * Verifica se um token é válido
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      return jwt.verify(token, this.jwtConfig.secret) as JWTPayload;
    } catch (error) {
      throw CommonErrors.UNAUTHORIZED("Token inválido");
    }
  }
}
