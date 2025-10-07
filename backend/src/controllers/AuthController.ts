import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { LoginData, RegisterData, InviteData } from "../models/Auth";
import { AuthenticatedRequest } from "../models/Auth";
import { prisma } from "../utils/database";
import { asyncHandler } from "../middleware/errorHandler";
import { body, validationResult } from "express-validator";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(prisma);
  }

  /**
   * POST /login - Autentica um usuário
   */
  login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await body("login")
        .notEmpty()
        .withMessage("Login é obrigatório")
        .run(req);
      await body("senha")
        .isLength({ min: 6 })
        .withMessage("Senha deve ter pelo menos 6 caracteres")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: "Dados inválidos",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
        return;
      }

      const loginData: LoginData = req.body;
      const result = await this.authService.login(loginData);

      // Configurar cookies HttpOnly para tokens
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutos
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
      });

      res.json({
        success: true,
        data: {
          user: result.user
          // Não enviar tokens no body - estão nos cookies
        },
        message: "Login realizado com sucesso",
      });
    }
  );

  /**
   * POST /register - Registra um novo usuário via convite
   */
  register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await body("nome").notEmpty().withMessage("Nome é obrigatório").run(req);
      await body("login")
        .isLength({ min: 3 })
        .withMessage("Login deve ter pelo menos 3 caracteres")
        .run(req);
      await body("senha")
        .isLength({ min: 8 })
        .withMessage("Senha deve ter pelo menos 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage("Senha deve conter: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial")
        .run(req);
      await body("token")
        .notEmpty()
        .withMessage("Token do convite é obrigatório")
        .run(req);
      await body("emailValidacao")
        .optional()
        .isEmail()
        .withMessage("Email de validação inválido")
        .run(req);
      await body("telefoneValidacao")
        .optional()
        .isMobilePhone("pt-BR")
        .withMessage("Telefone de validação inválido")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: "Dados inválidos",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
        return;
      }

      const registerData: RegisterData = req.body;
      const result = await this.authService.register(registerData);

      // Configurar cookies HttpOnly para tokens após registro
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutos
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user
          // Não enviar tokens no body - estão nos cookies
        },
        message: "Usuário registrado com sucesso",
      });
    }
  );

  /**
   * POST /refresh - Renova o access token
   */
  refresh = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Primeiro tenta pegar do cookie, depois do body
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: "Refresh token é obrigatório",
          code: "MISSING_REFRESH_TOKEN",
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      // Atualizar cookie com novo access token
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutos
      });

      res.json({
        success: true,
        data: {
          expiresIn: result.expiresIn
          // Não enviar tokens no body - estão nos cookies
        },
        message: "Token renovado com sucesso",
      });
    }
  );

  /**
   * POST /invite - Cria um convite para novo administrador
   */
  createInvite = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      await body("email")
        .optional()
        .isEmail()
        .withMessage("Email inválido")
        .run(req);
      await body("telefone")
        .optional()
        .isMobilePhone("pt-BR")
        .withMessage("Telefone inválido")
        .run(req);

      await body().custom((value, { req }) => {
        const { email, telefone } = req.body;
        if (!email && !telefone) {
          throw new Error('Email ou telefone é obrigatório');
        }
        return true;
      }).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: "Dados inválidos",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
        return;
      }

      const inviteData: InviteData = req.body;
      const result = await this.authService.createInvite(
        inviteData,
        req.user!.id
      );

      res.status(201).json({
        success: true,
        data: result,
        message: "Convite criado com sucesso",
      });
    }
  );

  /**
   * GET /active-invite - Retorna o convite ativo do usuário
   */
  getActiveInvite = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const result = await this.authService.getActiveInvite(req.user!.id);

      res.json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /me - Retorna dados do usuário autenticado
   */
  me = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const user = await prisma.administrador.findUnique({
        where: { id: req.user!.id },
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
    }
  );

  /**
   * POST /logout - Logout e limpa cookies
   */
  logout = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // Limpar cookies HttpOnly
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.json({
        success: true,
        message: "Logout realizado com sucesso",
      });
    }
  );

  /**
   * GET /invite/:token - Valida um token de convite
   */
  validateInvite = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
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
        const convite = await prisma.convite.findUnique({
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
      } catch (error) {
        next(error);
      }
    }
  );
}
