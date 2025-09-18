import { ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { CommonErrors } from './errorHandler';

/**
 * Middleware para validar request usando express-validator
 * @param validations Array de validações do express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Executa todas as validações
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    throw CommonErrors.VALIDATION_ERROR(
      `Dados inválidos: ${errors.array()[0].msg}`
    );
  };
};