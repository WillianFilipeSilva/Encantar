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
import { createBrazilTimestamp } from "../utils/dateUtils";
import { CommonErrors } from "../middleware/errorHandler";
import { randomBytes } from "crypto";

export class AuthService {
  private prisma: PrismaClient;
  private jwtConfig: JWTConfig;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    
    // Validar que os segredos estão configurados
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || jwtSecret.includes('fallback') || jwtSecret.includes('ENCANTAR-SECRET')) {
      throw new Error('JWT_SECRET não está configurado corretamente. Configure uma chave forte em produção.');
    }

    if (!jwtRefreshSecret || jwtRefreshSecret.includes('fallback') || jwtRefreshSecret.includes('ENCANTAR-SECRET')) {
      throw new Error('JWT_REFRESH_SECRET não está configurado corretamente. Configure uma chave forte em produção.');
    }

    this.jwtConfig = {
      secret: jwtSecret,
      refreshSecret: jwtRefreshSecret,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    };
  }

  /**
   * Autentica um usuário
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    const { login, senha } = loginData;

    console.log("🔍 AuthService.login - Iniciando:", {
      login,
      hasPassword: !!senha,
      timestamp: new Date().toISOString(),
    });

    try {
      console.log("📊 Buscando administrador no banco...");
      const administrador = await this.prisma.administrador.findUnique({
        where: { login },
      });

      console.log("📊 Resultado da busca:", {
        found: !!administrador,
        active: administrador?.ativo,
        hasPassword: !!administrador?.senha,
      });

      if (!administrador) {
        console.log("❌ Administrador não encontrado");
        throw CommonErrors.UNAUTHORIZED("Login ou senha inválidos");
      }

      if (!administrador.ativo) {
        console.log("❌ Administrador desativado");
        throw CommonErrors.UNAUTHORIZED("Conta desativada");
      }

      console.log("🔐 Verificando senha...");
      const senhaValida = await bcrypt.compare(senha, administrador.senha);
      
      if (!senhaValida) {
        console.log("❌ Senha inválida");
        throw CommonErrors.UNAUTHORIZED("Login ou senha inválidos");
      }

      console.log("✅ Senha válida, gerando tokens...");
      const tokens = this.generateTokens({
        id: administrador.id,
        login: administrador.login,
        nome: administrador.nome,
      });

      console.log("✅ Tokens gerados com sucesso");
      return {
        user: {
          id: administrador.id,
          nome: administrador.nome,
          login: administrador.login,
        },
        ...tokens,
      };
    } catch (error) {
      console.error("💥 Erro no AuthService.login:", {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        login,
        timestamp: new Date().toISOString(),
      });
      throw error; // Re-throw o erro para manter o comportamento original
    }
  }

  /**
   * Registra um novo administrador via convite
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    const { nome, login, senha, token, emailValidacao, telefoneValidacao } = registerData;

    const convite = await this.validateInviteForRegistration(token, emailValidacao, telefoneValidacao);

    const loginExiste = await this.prisma.administrador.findUnique({
      where: { login },
    });

    if (loginExiste) {
      throw CommonErrors.CONFLICT("Login já está em uso");
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const administrador = await this.prisma.administrador.create({
      data: {
        nome,
        login,
        senha: senhaHash,
      },
    });

    await this.prisma.convite.update({
      where: { id: convite.id },
      data: { usado: true, usadoEm: createBrazilTimestamp() },
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

  /**
   * Cria um convite para novo administrador
   * Apenas um convite ativo por administrador é permitido
   */
  async createInvite(
    inviteData: InviteData,
    enviadoPorId: string
  ): Promise<{ token: string; expiraEm: Date }> {
    const { email, telefone } = inviteData;

    if (!email && !telefone) {
      throw CommonErrors.BAD_REQUEST("Email ou telefone é obrigatório para validação do convite");
    }

    const conviteAtivo = await this.prisma.convite.findFirst({
      where: {
        enviadoPorId,
        usado: false,
        expiraEm: {
          gt: createBrazilTimestamp()
        }
      }
    });

    if (conviteAtivo) {
      throw CommonErrors.CONFLICT("Já existe um convite ativo. Aguarde sua expiração antes de criar um novo.");
    }

    const token = randomBytes(32).toString("hex");

    const expiraEm = createBrazilTimestamp();
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

  /**
   * Busca o convite ativo do administrador
   */
  async getActiveInvite(enviadoPorId: string): Promise<{ token: string; expiraEm: Date } | null> {
    const conviteAtivo = await this.prisma.convite.findFirst({
      where: {
        enviadoPorId,
        usado: false,
        expiraEm: {
          gt: createBrazilTimestamp()
        }
      },
      orderBy: {
        criadoEm: 'desc'
      }
    });

    if (!conviteAtivo) {
      return null;
    }

    return {
      token: conviteAtivo.token,
      expiraEm: conviteAtivo.expiraEm,
    };
  }

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = jwt.verify(
        refreshToken,
        this.jwtConfig.refreshSecret
      ) as JWTPayload;

      const administrador = await this.prisma.administrador.findUnique({
        where: { id: payload.id },
      });

      if (!administrador || !administrador.ativo) {
        throw CommonErrors.UNAUTHORIZED("Token inválido");
      }

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

    if (convite.expiraEm < createBrazilTimestamp()) {
      throw CommonErrors.BAD_REQUEST("Convite expirado");
    }

    return convite;
  }

  /**
   * Valida um token de convite com email/telefone para registro
   */
  private async validateInviteForRegistration(
    token: string, 
    emailValidacao?: string, 
    telefoneValidacao?: string
  ) {
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

    if (convite.expiraEm < createBrazilTimestamp()) {
      throw CommonErrors.BAD_REQUEST("Convite expirado");
    }

    if (convite.email && convite.email !== emailValidacao) {
      throw CommonErrors.BAD_REQUEST("Email informado não confere com o convite");
    }

    if (convite.telefone && convite.telefone !== telefoneValidacao) {
      throw CommonErrors.BAD_REQUEST("Telefone informado não confere com o convite");
    }

    if ((convite.email || convite.telefone) && !emailValidacao && !telefoneValidacao) {
      throw CommonErrors.BAD_REQUEST("É necessário informar o email ou telefone para validar o convite");
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
        return 15 * 60;
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
