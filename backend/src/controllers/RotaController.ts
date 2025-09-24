import { Request, Response, NextFunction } from "express";
import { Rota } from "@prisma/client";
import { BaseController } from "./BaseController";
import { RotaService } from "../services/RotaService";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { query, validationResult } from "express-validator";

export class RotaController extends BaseController<
  Rota,
  CreateRotaDTO,
  UpdateRotaDTO
> {
  private rotaService: RotaService;

  constructor(rotaService: RotaService) {
    super(rotaService);
    this.rotaService = rotaService;
  }

  /**
   * GET / - Lista todas as rotas com paginação
   */
  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validação dos query parameters
      await query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Página deve ser um número positivo")
        .run(req);
      await query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit deve ser entre 1 e 100")
        .run(req);
      await query("search")
        .optional()
        .custom((value) => {
          // Se está presente e não é vazio, deve ter pelo menos 2 caracteres
          if (value && value.trim().length > 0 && value.trim().length < 2) {
            throw new Error("Busca deve ter pelo menos 2 caracteres");
          }
          return true;
        })
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Parâmetros inválidos: ${errors.array()[0].msg}`);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.rotaService.findAllWithRelations(
        page,
        limit,
        filters
      );

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
   * GET /:id - Busca uma rota por ID com relacionamentos
   */
  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      const result = await this.rotaService.findByIdWithRelations(id);

      res.json({
        success: true,
        data: result,
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

    // Filtro por busca
    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { descricao: { contains: query.search, mode: "insensitive" } },
        { observacoes: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Filtro por data de entrega
    if (query.dataInicio) {
      filters.dataEntrega = {
        ...filters.dataEntrega,
        gte: new Date(query.dataInicio),
      };
    }

    if (query.dataFim) {
      filters.dataEntrega = {
        ...filters.dataEntrega,
        lte: new Date(query.dataFim),
      };
    }

    return filters;
  }
}
