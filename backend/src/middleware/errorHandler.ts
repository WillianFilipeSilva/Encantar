import { Request, Response, NextFunction } from "express";
import { formatBrazilDateTime } from "../utils/dateUtils";

/**
 * Interface para erros customizados
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Classe para erros customizados da aplicação
 */
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de tratamento de erros
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log detalhado do erro sempre (produção e desenvolvimento)
  console.error("🚨 Erro capturado no errorHandler:", {
    message: error.message,
    name: error.name,
    statusCode: error.statusCode,
    code: error.code,
    isOperational: error.isOperational,
    url: req.url,
    method: req.method,
    timestamp: formatBrazilDateTime(new Date()),
    ...(process.env.NODE_ENV === "development" && {
      body: req.body,
      query: req.query,
      params: req.params,
      stack: error.stack,
    }),
  });

  // Se não é um erro operacional conhecido, tratar como erro interno
  if (!error.isOperational) {
    console.error("⚠️ ERRO NÃO OPERACIONAL DETECTADO:", {
      originalMessage: error.message,
      originalName: error.name,
      stack: error.stack,
    });
    
    error = new CustomError(
      process.env.NODE_ENV === "development" 
        ? `Erro interno: ${error.message}` 
        : "Erro interno do servidor",
      500,
      "INTERNAL_SERVER_ERROR"
    );
  }

  const response = {
    success: false,
    error: error.message,
    code: error.code || "UNKNOWN_ERROR",
    ...(process.env.NODE_ENV === "development" && {
      originalError: error.name,
      stack: error.stack,
      details: {
        url: req.url,
        method: req.method,
        timestamp: formatBrazilDateTime(new Date()),
      },
    }),
  };

  res.status(error.statusCode || 500).json(response);
};

/**
 * Middleware para capturar erros assíncronos
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Função para criar erros customizados
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string
) => {
  return new CustomError(message, statusCode, code);
};

/**
 * Erros comuns pré-definidos
 */
export const CommonErrors = {
  NOT_FOUND: (resource: string = "Recurso") =>
    new CustomError(`${resource} não encontrado`, 404, "NOT_FOUND"),

  UNAUTHORIZED: (message: string = "Não autorizado") =>
    new CustomError(message, 401, "UNAUTHORIZED"),

  FORBIDDEN: (message: string = "Acesso negado") =>
    new CustomError(message, 403, "FORBIDDEN"),

  BAD_REQUEST: (message: string = "Dados inválidos") =>
    new CustomError(message, 400, "BAD_REQUEST"),

  CONFLICT: (message: string = "Conflito de dados") =>
    new CustomError(message, 409, "CONFLICT"),

  VALIDATION_ERROR: (message: string = "Erro de validação") =>
    new CustomError(message, 422, "VALIDATION_ERROR"),

  INTERNAL_ERROR: (message: string = "Erro interno do servidor") =>
    new CustomError(message, 500, "INTERNAL_ERROR"),
};

