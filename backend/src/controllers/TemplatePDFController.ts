import { Request, Response, NextFunction } from "express";
import { TemplatePDFService } from "../services/TemplatePDFService";
import { BaseController } from "./BaseController";
import { TemplatePDF } from "@prisma/client";
import {
  CreateTemplatePDFDTO,
  UpdateTemplatePDFDTO,
} from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { body, query, validationResult } from "express-validator";
import { serializeDateForAPI } from "../utils/dateUtils";

export class TemplatePDFController extends BaseController<
  TemplatePDF,
  CreateTemplatePDFDTO,
  UpdateTemplatePDFDTO
> {
  private templateService: TemplatePDFService;

  constructor(templateService: TemplatePDFService) {
    super(templateService);
    this.templateService = templateService;
  }

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

      const result = await this.templateService.findAll(page, limit, filters);

      const serializedData = result.data.map((template: any) => ({
        ...template,
        criadoEm: serializeDateForAPI(template.criadoEm),
        atualizadoEm: serializeDateForAPI(template.atualizadoEm),
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

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      const result = await this.templateService.findById(id);

      const serializedData = {
        ...result,
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

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await body("nome")
        .notEmpty()
        .withMessage("Nome é obrigatório")
        .isLength({ min: 2, max: 100 })
        .withMessage("Nome deve ter entre 2 e 100 caracteres")
        .run(req);
      await body("descricao")
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage("Descrição deve ter no máximo 500 caracteres")
        .run(req);
      await body("conteudo")
        .notEmpty()
        .withMessage("Conteúdo é obrigatório")
        .isLength({ min: 10 })
        .withMessage("Conteúdo deve ter pelo menos 10 caracteres")
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Dados inválidos: ${errors.array()[0].msg}`);
      }

      const data: CreateTemplatePDFDTO = req.body;

      const result = await this.templateService.create(data);

      const serializedData = {
        ...result,
        criadoEm: serializeDateForAPI(result.criadoEm),
        atualizadoEm: serializeDateForAPI(result.atualizadoEm),
      };

      res.status(201).json({
        success: true,
        data: serializedData,
        message: "Template criado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

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
      await body("descricao")
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage("Descrição deve ter no máximo 500 caracteres")
        .run(req);
      await body("conteudo")
        .optional({ checkFalsy: true })
        .isLength({ min: 10 })
        .withMessage("Conteúdo deve ter pelo menos 10 caracteres")
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

      const data: UpdateTemplatePDFDTO = req.body;

      const result = await this.templateService.update(id, data);

      const serializedData = {
        ...result,
        criadoEm: serializeDateForAPI(result.criadoEm),
        atualizadoEm: serializeDateForAPI(result.atualizadoEm),
      };

      res.json({
        success: true,
        data: serializedData,
        message: "Template atualizado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      await this.templateService.delete(id);

      res.json({
        success: true,
        message: "Template removido com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };

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

      const result = await this.templateService.findByNome(q as string, limit);

      const serializedData = result.map((template: any) => ({
        ...template,
        criadoEm: serializeDateForAPI(template.criadoEm),
        atualizadoEm: serializeDateForAPI(template.atualizadoEm),
      }));

      res.json({
        success: true,
        data: serializedData,
      });
    } catch (error) {
      next(error);
    }
  };

  findActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.templateService.findActiveTemplates();

      const serializedData = result.map((template: any) => ({
        ...template,
        criadoEm: serializeDateForAPI(template.criadoEm),
        atualizadoEm: serializeDateForAPI(template.atualizadoEm),
      }));

      res.json({
        success: true,
        data: serializedData,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleAtivo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      const result = await this.templateService.toggleAtivo(id);

      const serializedData = {
        ...result,
        criadoEm: serializeDateForAPI(result.criadoEm),
        atualizadoEm: serializeDateForAPI(result.atualizadoEm),
      };

      res.json({
        success: true,
        data: serializedData,
        message: `Template ${result.ativo ? 'ativado' : 'desativado'} com sucesso`,
      });
    } catch (error) {
      next(error);
    }
  };

  protected buildFilters(query: any): any {
    const filters: any = {};

    if (query.ativo !== undefined && query.ativo !== 'all') {
      filters.ativo = query.ativo === "true";
    }

    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { descricao: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return filters;
  }
}