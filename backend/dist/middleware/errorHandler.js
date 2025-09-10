"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonErrors = exports.createError = exports.asyncHandler = exports.errorHandler = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const errorHandler = (error, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        console.error("🚨 Erro capturado:", {
            message: error.message,
            stack: error.stack,
            url: req.url,
            method: req.method,
            body: req.body,
            query: req.query,
            params: req.params,
            timestamp: new Date().toISOString(),
        });
    }
    if (!error.isOperational) {
        error = new CustomError("Erro interno do servidor", 500, "INTERNAL_SERVER_ERROR");
    }
    const response = {
        success: false,
        error: error.message,
        code: error.code || "UNKNOWN_ERROR",
        ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
            details: {
                url: req.url,
                method: req.method,
                timestamp: new Date().toISOString(),
            },
        }),
    };
    res.status(error.statusCode || 500).json(response);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const createError = (message, statusCode = 500, code) => {
    return new CustomError(message, statusCode, code);
};
exports.createError = createError;
exports.CommonErrors = {
    NOT_FOUND: (resource = "Recurso") => new CustomError(`${resource} não encontrado`, 404, "NOT_FOUND"),
    UNAUTHORIZED: (message = "Não autorizado") => new CustomError(message, 401, "UNAUTHORIZED"),
    FORBIDDEN: (message = "Acesso negado") => new CustomError(message, 403, "FORBIDDEN"),
    BAD_REQUEST: (message = "Dados inválidos") => new CustomError(message, 400, "BAD_REQUEST"),
    CONFLICT: (message = "Conflito de dados") => new CustomError(message, 409, "CONFLICT"),
    VALIDATION_ERROR: (message = "Erro de validação") => new CustomError(message, 422, "VALIDATION_ERROR"),
    INTERNAL_ERROR: (message = "Erro interno do servidor") => new CustomError(message, 500, "INTERNAL_ERROR"),
};
//# sourceMappingURL=errorHandler.js.map