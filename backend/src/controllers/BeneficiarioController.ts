import { Request, Response, NextFunction } from "express";
import { BeneficiarioService } from "../services/BeneficiarioService";
import { BaseController } from "./BaseController";
import { Beneficiario } from "@prisma/client";
import {
  CreateBeneficiarioDTO,
  UpdateBeneficiarioDTO,
  BeneficiarioResponseDTO,
} from "../models/DTOs";
import { asyncHandler } from "../middleware/errorHandler";
import { body, query, validationResult } from "express-validator";

export class BeneficiarioController extends BaseController<
  Beneficiario,
  CreateBeneficiarioDTO,
  UpdateBeneficiarioDTO
> {
  private beneficiarioService: BeneficiarioService;

  constructor(beneficiarioService: BeneficiarioService) {
    super(beneficiarioService);
    this.beneficiarioService = beneficiarioService;
  }

  /**
   * GET / - Lista todos os beneficiários com paginação
   */
  findAll = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        .isLength({ min: 2 })
        .withMessage("Busca deve ter pelo menos 2 caracteres")
        .run(req);
      await query("ativo")
        .optional()
        .isBoolean()
        .withMessage("Ativo deve ser true ou false")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: "Parâmetros inválidos",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.beneficiarioService.findAllWithRelations(
        page,
        limit,
        filters
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    }
  );

  /**
   * GET /:id - Busca um beneficiário por ID com relacionamentos
   */
  findById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID é obrigatório",
          code: "MISSING_ID",
        });
        return;
      }

      const result = await this.beneficiarioService.findByIdWithRelations(id);

      res.json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST / - Cria um novo beneficiário
   */
  create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Validação dos dados
      await body("nome")
        .notEmpty()
        .withMessage("Nome é obrigatório")
        .isLength({ min: 2, max: 100 })
        .withMessage("Nome deve ter entre 2 e 100 caracteres")
        .run(req);
      await body("endereco")
        .notEmpty()
        .withMessage("Endereço é obrigatório")
        .isLength({ min: 5, max: 200 })
        .withMessage("Endereço deve ter entre 5 e 200 caracteres")
        .run(req);
      await body("telefone")
        .optional()
        .isLength({ min: 10, max: 15 })
        .withMessage("Telefone deve ter entre 10 e 15 caracteres")
        .run(req);
      await body("email")
        .optional()
        .isEmail()
        .withMessage("Email inválido")
        .run(req);
      await body("observacoes")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Observações deve ter no máximo 500 caracteres")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: "Dados inválidos",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
        return;
      }

      const data: CreateBeneficiarioDTO = req.body;
      const userId = (req as any).user?.id;

      const result = await this.beneficiarioService.create(data, userId);

      res.status(201).json({
        success: true,
        data: result,
        message: "Beneficiário criado com sucesso",
      });
    }
  );

  /**
   * PUT /:id - Atualiza um beneficiário
   */
  update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID é obrigatório",
          code: "MISSING_ID",
        });
        return;
      }

      // Validação dos dados
      await body("nome")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Nome deve ter entre 2 e 100 caracteres")
        .run(req);
      await body("endereco")
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage("Endereço deve ter entre 5 e 200 caracteres")
        .run(req);
      await body("telefone")
        .optional()
        .isLength({ min: 10, max: 15 })
        .withMessage("Telefone deve ter entre 10 e 15 caracteres")
        .run(req);
      await body("email")
        .optional()
        .isEmail()
        .withMessage("Email inválido")
        .run(req);
      await body("observacoes")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Observações deve ter no máximo 500 caracteres")
        .run(req);
      await body("ativo")
        .optional()
        .isBoolean()
        .withMessage("Ativo deve ser true ou false")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: "Dados inválidos",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
        return;
      }

      const data: UpdateBeneficiarioDTO = req.body;
      const userId = (req as any).user?.id;

      const result = await this.beneficiarioService.update(id, data, userId);

      res.json({
        success: true,
        data: result,
        message: "Beneficiário atualizado com sucesso",
      });
    }
  );

  /**
   * DELETE /:id - Remove um beneficiário (soft delete)
   */
  delete = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID é obrigatório",
          code: "MISSING_ID",
        });
        return;
      }

      await this.beneficiarioService.delete(id);

      res.json({
        success: true,
        message: "Beneficiário removido com sucesso",
      });
    }
  );

  /**
   * GET /search - Busca beneficiários por nome
   */
  search = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await query("q")
        .notEmpty()
        .withMessage("Parâmetro de busca é obrigatório")
        .isLength({ min: 2 })
        .withMessage("Busca deve ter pelo menos 2 caracteres")
        .run(req);
      await query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Limit deve ser entre 1 e 50")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: "Parâmetros inválidos",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
        return;
      }

      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.beneficiarioService.findByNome(
        q as string,
        limit
      );

      res.json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /active - Lista beneficiários ativos para seleção
   */
  findActive = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const result = await this.beneficiarioService.findActiveForSelection();

      res.json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /top - Lista beneficiários com mais entregas
   */
  findTop = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Limit deve ser entre 1 e 50")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: "Parâmetros inválidos",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.beneficiarioService.findTopBeneficiarios(limit);

      res.json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * Constrói filtros a partir dos query parameters
   */
  protected buildFilters(query: any): any {
    const filters: any = {};

    // Filtro por ativo
    if (query.ativo !== undefined) {
      filters.ativo = query.ativo === "true";
    }

    // Filtro por busca
    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { endereco: { contains: query.search, mode: "insensitive" } },
        { telefone: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Filtro por data
    if (query.dataInicio) {
      filters.criadoEm = {
        ...filters.criadoEm,
        gte: new Date(query.dataInicio),
      };
    }

    if (query.dataFim) {
      filters.criadoEm = {
        ...filters.criadoEm,
        lte: new Date(query.dataFim),
      };
    }

    return filters;
  }
}

