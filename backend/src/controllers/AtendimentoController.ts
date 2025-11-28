import { Request, Response, NextFunction } from "express";
import { Atendimento } from "@prisma/client";
import { BaseController } from "./BaseController";
import { AtendimentoService } from "../services/AtendimentoService";
import { CreateAtendimentoDTO, UpdateAtendimentoDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { body, param, validationResult } from "express-validator";

export class AtendimentoController extends BaseController<
  Atendimento,
  CreateAtendimentoDTO,
  UpdateAtendimentoDTO
> {
  private atendimentoService: AtendimentoService;

  constructor(service: AtendimentoService) {
    super(service);
    this.atendimentoService = service;
  }

  /**
   * POST / - Cria um novo atendimento com validação
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validações
      await body("beneficiarioId")
        .notEmpty()
        .withMessage("Beneficiário é obrigatório")
        .isString()
        .withMessage("ID do beneficiário deve ser uma string")
        .run(req);
      
      await body("rotaId")
        .notEmpty()
        .withMessage("Rota é obrigatória")
        .isString()
        .withMessage("ID da rota deve ser uma string")
        .run(req);
      
      await body("observacoes")
        .optional({ checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage("Observações deve ter no máximo 2000 caracteres")
        .run(req);
      
      await body("items")
        .isArray({ min: 1 })
        .withMessage("Deve haver pelo menos um item")
        .run(req);
      
      await body("items.*.itemId")
        .notEmpty()
        .withMessage("ID do item é obrigatório")
        .isString()
        .withMessage("ID do item deve ser uma string")
        .run(req);
      
      await body("items.*.quantidade")
        .isInt({ min: 1, max: 9999 })
        .withMessage("Quantidade deve ser um número entre 1 e 9999")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
      }

      const data: CreateAtendimentoDTO = req.body;
      const userId = (req as any).user?.id;

      const result = await this.atendimentoService.create(data, userId);

      res.status(201).json({
        success: true,
        data: result,
        message: "Atendimento criado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /:id - Atualiza um atendimento com validação
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      // Validações
      await body("beneficiarioId")
        .optional()
        .isString()
        .withMessage("ID do beneficiário deve ser uma string")
        .run(req);
      
      await body("rotaId")
        .optional()
        .isString()
        .withMessage("ID da rota deve ser uma string")
        .run(req);
      
      await body("observacoes")
        .optional({ checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage("Observações deve ter no máximo 2000 caracteres")
        .run(req);
      
      await body("status")
        .optional()
        .isIn(["PENDENTE", "CONCLUIDO", "CANCELADO"])
        .withMessage("Status deve ser PENDENTE, CONCLUIDO ou CANCELADO")
        .run(req);
      
      await body("items")
        .optional()
        .isArray()
        .withMessage("Items deve ser um array")
        .run(req);
      
      await body("items.*.itemId")
        .optional()
        .isString()
        .withMessage("ID do item deve ser uma string")
        .run(req);
      
      await body("items.*.quantidade")
        .optional()
        .isInt({ min: 1, max: 9999 })
        .withMessage("Quantidade deve ser um número entre 1 e 9999")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
      }

      const data: UpdateAtendimentoDTO = req.body;
      const userId = (req as any).user?.id;

      const result = await this.atendimentoService.update(id, data, userId);

      res.json({
        success: true,
        data: result,
        message: "Atendimento atualizado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };
}