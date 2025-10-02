import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { AuthenticatedRequest } from "../models/Auth";
import { CommonErrors } from "./errorHandler";
import { prisma } from "../utils/database";

/**
 * Middleware de autenticação JWT
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const authService = new AuthService(prisma);
    const payload = await authService.verifyToken(token);

    const user = await prisma.administrador.findUnique({
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
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Token inválido",
      code: "INVALID_TOKEN",
    });
  }
};

/**
 * Middleware opcional de autenticação (não falha se não houver token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const authService = new AuthService(prisma);
      const payload = await authService.verifyToken(token);

      const user = await prisma.administrador.findUnique({
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
  } catch (error) {
    next();
  }
};

/**
 * Middleware para verificar se o usuário é o mesmo do recurso
 */
export const checkOwnership = (resourceIdParam: string = "id") => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar permissões específicas
 */
export const requirePermission = (permission: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
    } catch (error) {
      next(error);
    }
  };
};
