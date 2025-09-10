import { Request, Response, NextFunction } from "express";
import { CommonErrors } from "./errorHandler";

/**
 * Middleware para rotas não encontradas
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = CommonErrors.NOT_FOUND(`Rota ${req.method} ${req.originalUrl}`);
  next(error);
};

