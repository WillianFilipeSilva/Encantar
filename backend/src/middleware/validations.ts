import { body, param, query } from 'express-validator';

/**
 * Validações comuns reutilizáveis
 */
export const commonValidations = {
  // Validações de parâmetros
  id: param('id')
    .matches(/^[a-z0-9]+$/)
    .withMessage('ID inválido'),

  // Validações de paginação
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
    
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número inteiro entre 1 e 100'),

  // Validações de texto
  nome: body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),

  email: body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  telefone: body('telefone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Telefone deve ter 10 ou 11 dígitos numéricos'),

  // Validações de segurança
  password: body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/[A-Z]/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/)
    .withMessage('Senha deve conter pelo menos um número')
    .matches(/[!@#$%^&*]/)
    .withMessage('Senha deve conter pelo menos um caractere especial'),

  // Validações de conteúdo
  observacoes: body('observacoes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Observações deve ter no máximo 500 caracteres'),

  // Sanitizações
  sanitizeString: (field: string) => 
    body(field)
      .trim()
      .escape(),
};