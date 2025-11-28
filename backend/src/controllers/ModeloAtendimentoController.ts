import { Request, Response, NextFunction } from "express";
import { ModeloAtendimento } from "@prisma/client";
import { BaseController } from "./BaseController";
import { ModeloAtendimentoService } from "../services/ModeloAtendimentoService";
import { CreateModeloAtendimentoDTO, UpdateModeloAtendimentoDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { body, query, validationResult } from "express-validator";

export class ModeloAtendimentoController extends BaseController<
  ModeloAtendimento,
  CreateModeloAtendimentoDTO,
  UpdateModeloAtendimentoDTO
> {
  private modeloService: ModeloAtendimentoService;

  constructor(service: ModeloAtendimentoService) {
    super(service);
    this.modeloService = service;
  }

  /**
   * GET / - Lista todos os modelos com paginação e validação
   */
  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Página deve ser um número positivo")
        .run(req);
      await query("limit")
        .optional()
        .isInt({ min: 1, max: 500 })
        .withMessage("Limit deve ser entre 1 e 500")
        .run(req);
      await query("search")
        .optional()
        .isLength({ max: 200 })
        .withMessage("Busca deve ter no máximo 200 caracteres")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Parâmetros inválidos: ${errors.array()[0].msg}`);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.modeloService.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST / - Cria um novo modelo de atendimento com validação
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validações
      await body("nome")
        .notEmpty()
        .withMessage("Nome é obrigatório")
        .isLength({ min: 3, max: 100 })
        .withMessage("Nome deve ter entre 3 e 100 caracteres")
        .run(req);
      
      await body("descricao")
        .optional({ checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage("Descrição deve ter no máximo 2000 caracteres")
        .run(req);
      
      await body("modeloItems")
        .isArray({ min: 1 })
        .withMessage("Deve haver pelo menos um item no modelo")
        .run(req);
      
      await body("modeloItems.*.itemId")
        .notEmpty()
        .withMessage("ID do item é obrigatório")
        .isString()
        .withMessage("ID do item deve ser uma string")
        .run(req);
      
      await body("modeloItems.*.quantidade")
        .isInt({ min: 1, max: 9999 })
        .withMessage("Quantidade deve ser um número entre 1 e 9999")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
      }

      const data: CreateModeloAtendimentoDTO = req.body;
      const userId = (req as any).user?.id;

      const result = await this.modeloService.create(data, userId);

      res.status(201).json({
        success: true,
        data: result,
        message: "Modelo de atendimento criado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /:id - Atualiza um modelo de atendimento com validação
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      // Validações
      await body("nome")
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage("Nome deve ter entre 3 e 100 caracteres")
        .run(req);
      
      await body("descricao")
        .optional({ checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage("Descrição deve ter no máximo 2000 caracteres")
        .run(req);
      
      await body("ativo")
        .optional()
        .isBoolean()
        .withMessage("Ativo deve ser true ou false")
        .run(req);
      
      await body("modeloItems")
        .optional()
        .isArray()
        .withMessage("modeloItems deve ser um array")
        .run(req);
      
      await body("modeloItems.*.itemId")
        .optional()
        .isString()
        .withMessage("ID do item deve ser uma string")
        .run(req);
      
      await body("modeloItems.*.quantidade")
        .optional()
        .isInt({ min: 1, max: 9999 })
        .withMessage("Quantidade deve ser um número entre 1 e 9999")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
      }

      const data: UpdateModeloAtendimentoDTO = req.body;
      const userId = (req as any).user?.id;

      const result = await this.modeloService.update(id, data, userId);

      res.json({
        success: true,
        data: result,
        message: "Modelo de atendimento atualizado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Constrói filtros a partir dos query parameters
   */
  protected buildFilters(query: any): any {
    const filters: any = {};

    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { descricao: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return filters;
  }
}
