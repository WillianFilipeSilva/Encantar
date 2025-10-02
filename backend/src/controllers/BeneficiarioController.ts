import { Request, Response, NextFunction } from "express";
import { BeneficiarioService } from "../services/BeneficiarioService";
import { BaseController } from "./BaseController";
import { Beneficiario } from "@prisma/client";
import {
  CreateBeneficiarioDTO,
  UpdateBeneficiarioDTO,
  BeneficiarioResponseDTO,
} from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { body, query, validationResult } from "express-validator";
import { createDateFromString, createBrazilTimestamp, toStartOfDayBrazil, toEndOfDayBrazil, serializeDateForAPI } from "../utils/dateUtils";

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
        .custom((value) => {
          if (value && value.trim().length > 0 && value.trim().length < 2) {
            throw new Error("Busca deve ter pelo menos 2 caracteres");
          }
          return true;
        })
        .run(req);
      await query("ativo")
        .optional()
        .custom((value) => {
          if (value && !['true', 'false', 'all'].includes(value.toLowerCase())) {
            throw new Error("Ativo deve ser 'true', 'false' ou 'all'");
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

      const result = await this.beneficiarioService.findAllWithRelations(
        page,
        limit,
        filters
      );

      const serializedData = result.data.map((beneficiario: any) => ({
        ...beneficiario,
        dataNascimento: beneficiario.dataNascimento ? serializeDateForAPI(beneficiario.dataNascimento) : null,
        criadoEm: serializeDateForAPI(beneficiario.criadoEm),
        atualizadoEm: serializeDateForAPI(beneficiario.atualizadoEm),
      }));

      res.json({
        success: true,
        data: serializedData,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /:id - Busca um beneficiário por ID com relacionamentos
   */
  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      const result = await this.beneficiarioService.findByIdWithRelations(id);

      const serializedData = {
        ...result,
        dataNascimento: result.dataNascimento ? serializeDateForAPI(result.dataNascimento) : null,
        criadoEm: serializeDateForAPI(result.criadoEm),
        atualizadoEm: serializeDateForAPI(result.atualizadoEm),
      };

      res.json({
        success: true,
        data: serializedData,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST / - Cria um novo beneficiário
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
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
        .optional({ checkFalsy: true })
        .isLength({ min: 10, max: 15 })
        .withMessage("Telefone deve ter entre 10 e 15 caracteres")
        .run(req);
      await body("email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Email inválido")
        .run(req);
      await body("dataNascimento")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage("Data de nascimento deve estar no formato ISO8601 (AAAA-MM-DD)")
        .run(req);
      await body("observacoes")
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage("Observações deve ter no máximo 500 caracteres")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
      }

      const data: CreateBeneficiarioDTO = req.body;
      const userId = (req as any).user?.id;

      const result = await this.beneficiarioService.create(data, userId);

      const serializedData = {
        ...result,
        dataNascimento: result.dataNascimento ? serializeDateForAPI(result.dataNascimento) : null,
        criadoEm: serializeDateForAPI(result.criadoEm),
        atualizadoEm: serializeDateForAPI(result.atualizadoEm),
      };

      res.status(201).json({
        success: true,
        data: serializedData,
        message: "Beneficiário criado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /:id - Atualiza um beneficiário
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      await body("nome")
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 100 })
        .withMessage("Nome deve ter entre 2 e 100 caracteres")
        .run(req);
      await body("endereco")
        .optional({ checkFalsy: true })
        .isLength({ min: 5, max: 200 })
        .withMessage("Endereço deve ter entre 5 e 200 caracteres")
        .run(req);
      await body("telefone")
        .optional({ checkFalsy: true })
        .isLength({ min: 10, max: 15 })
        .withMessage("Telefone deve ter entre 10 e 15 caracteres")
        .run(req);
      await body("email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Email inválido")
        .run(req);
      await body("dataNascimento")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage("Data de nascimento deve estar no formato ISO8601 (AAAA-MM-DD)")
        .run(req);
      await body("observacoes")
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage("Observações deve ter no máximo 500 caracteres")
        .run(req);
      await body("ativo")
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage("Ativo deve ser true ou false")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
      }

      const data: UpdateBeneficiarioDTO = req.body;
      const userId = (req as any).user?.id;

      const result = await this.beneficiarioService.update(id, data, userId);

      const serializedData = {
        ...result,
        dataNascimento: result.dataNascimento ? serializeDateForAPI(result.dataNascimento) : null,
        criadoEm: serializeDateForAPI(result.criadoEm),
        atualizadoEm: serializeDateForAPI(result.atualizadoEm),
      };

      res.json({
        success: true,
        data: serializedData,
        message: "Beneficiário atualizado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /:id - Remove um beneficiário (soft delete)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      await this.beneficiarioService.delete(id);

      res.json({
        success: true,
        message: "Beneficiário removido com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /search - Busca beneficiários por nome
   */
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
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
        throw CommonErrors.VALIDATION_ERROR(`Parâmetros inválidos: ${errors.array()[0].msg}`);
      }

      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.beneficiarioService.findByNome(
        q as string,
        limit
      );

      const serializedData = result.map((beneficiario: any) => ({
        ...beneficiario,
        dataNascimento: beneficiario.dataNascimento ? serializeDateForAPI(beneficiario.dataNascimento) : null,
        criadoEm: serializeDateForAPI(beneficiario.criadoEm),
        atualizadoEm: serializeDateForAPI(beneficiario.atualizadoEm),
      }));

      res.json({
        success: true,
        data: serializedData,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /active - Lista beneficiários ativos para seleção
   */
  findActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.beneficiarioService.findActiveForSelection();

      const serializedData = result.map((beneficiario: any) => ({
        ...beneficiario,
        dataNascimento: beneficiario.dataNascimento ? serializeDateForAPI(beneficiario.dataNascimento) : null,
        criadoEm: serializeDateForAPI(beneficiario.criadoEm),
        atualizadoEm: serializeDateForAPI(beneficiario.atualizadoEm),
      }));

      res.json({
        success: true,
        data: serializedData,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /top - Lista beneficiários com mais entregas
   */
  findTop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Limit deve ser entre 1 e 50")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Parâmetros inválidos: ${errors.array()[0].msg}`);
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.beneficiarioService.findTopBeneficiarios(limit);

      const serializedData = result.map((beneficiario: any) => ({
        ...beneficiario,
        dataNascimento: beneficiario.dataNascimento ? serializeDateForAPI(beneficiario.dataNascimento) : null,
        criadoEm: serializeDateForAPI(beneficiario.criadoEm),
        atualizadoEm: serializeDateForAPI(beneficiario.atualizadoEm),
      }));

      res.json({
        success: true,
        data: serializedData,
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

    if (query.ativo !== undefined && query.ativo !== 'all') {
      filters.ativo = query.ativo === "true";
    }

    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { observacoes: { contains: query.search, mode: "insensitive" } },
        { endereco: { contains: query.search, mode: "insensitive" } },
        { telefone: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.dataInicio) {
      const startDate = createDateFromString(query.dataInicio);
      filters.criadoEm = {
        ...filters.criadoEm,
        gte: toStartOfDayBrazil(startDate),
      };
    }

    if (query.dataFim) {
      const endDate = createDateFromString(query.dataFim);
      filters.criadoEm = {
        ...filters.criadoEm,
        lte: toEndOfDayBrazil(endDate),
      };
    }

    return filters;
  }
}

