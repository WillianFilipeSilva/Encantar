import { Request, Response, NextFunction } from "express";
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
}
export declare class CustomError extends Error implements AppError {
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const createError: (message: string, statusCode?: number, code?: string) => CustomError;
export declare const CommonErrors: {
    NOT_FOUND: (resource?: string) => CustomError;
    UNAUTHORIZED: (message?: string) => CustomError;
    FORBIDDEN: (message?: string) => CustomError;
    BAD_REQUEST: (message?: string) => CustomError;
    CONFLICT: (message?: string) => CustomError;
    VALIDATION_ERROR: (message?: string) => CustomError;
    INTERNAL_ERROR: (message?: string) => CustomError;
};
//# sourceMappingURL=errorHandler.d.ts.map