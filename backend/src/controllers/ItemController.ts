import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { ItemService } from "../services/ItemService";
import { CreateItemDTO, UpdateItemDTO } from "../models/DTOs";
import { AuthenticatedRequest } from "../models/Auth";
import { body, param, query, validationResult } from "express-validator";
import { Item } from "@prisma/client";

export class ItemController extends BaseController<
  Item,
  CreateItemDTO,
  UpdateItemDTO
> {
  private itemService: ItemService;

  constructor(itemService: ItemService) {
    super(itemService);
    this.itemService = itemService;
  }

  /**
   * Validação para criação de item
   */
  private validateCreate = [
    body("nome")
      .notEmpty()
      .withMessage("Nome é obrigatório")
      .isLength({ max: 100 })
      .withMessage("Nome deve ter no máximo 100 caracteres")
      .trim(),
    body("unidade")
      .notEmpty()
      .withMessage("Unidade é obrigatória")
      .isLength({ max: 20 })
      .withMessage("Unidade deve ter no máximo 20 caracteres")
      .trim(),
    body("descricao")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Descrição deve ter no máximo 500 caracteres")
      .trim(),
    body("ativo")
      .optional()
      .isBoolean()
      .withMessage("Ativo deve ser um valor booleano"),
  ];

  /**
   * Validação para atualização de item
   */
  private validateUpdate = [
    param("id").matches(/^[a-z0-9]+$/).withMessage("ID inválido"),
    body("nome")
      .optional()
      .notEmpty()
      .withMessage("Nome não pode estar vazio")
      .isLength({ max: 100 })
      .withMessage("Nome deve ter no máximo 100 caracteres")
      .trim(),
    body("unidade")
      .optional()
      .notEmpty()
      .withMessage("Unidade não pode estar vazia")
      .isLength({ max: 20 })
      .withMessage("Unidade deve ter no máximo 20 caracteres")
      .trim(),
    body("descricao")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Descrição deve ter no máximo 500 caracteres")
      .trim(),
    body("ativo")
      .optional()
      .isBoolean()
      .withMessage("Ativo deve ser um valor booleano"),
  ];

  /**
   * Validação para parâmetros de busca
   */
  private validateSearch = [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Página deve ser um número inteiro maior que 0"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limite deve ser um número entre 1 e 100"),
    query("nome")
      .optional()
      .custom((value) => {
        if (value === "") return true; // Permite string vazia
        if (value && value.length < 2) {
          throw new Error("Nome de busca deve ter pelo menos 2 caracteres se fornecido");
        }
        if (value && value.length > 100) {
          throw new Error("Nome de busca deve ter no máximo 100 caracteres");
        }
        return true;
      })
      .trim(),
    query("unidade")
      .optional()
      .custom((value) => {
        if (value === "") return true; // Permite string vazia
        if (value && value.length > 20) {
          throw new Error("Unidade de busca deve ter no máximo 20 caracteres");
        }
        return true;
      })
      .trim(),
    query("ativo")
      .optional()
      .isBoolean()
      .withMessage("Ativo deve ser um valor booleano"),
  ];

  /**
   * Validação para ID
   */
  private validateId = [
    param("id").matches(/^[a-z0-9]+$/).withMessage("ID inválido"),
  ];

  /**
   * Validação para busca por nome
   */
  private validateSearchByName = [
    query("nome")
      .custom((value) => {
        if (!value || value.trim() === "") {
          throw new Error("Nome é obrigatório para busca");
        }
        if (value.length < 2) {
          throw new Error("Nome deve ter pelo menos 2 caracteres");
        }
        if (value.length > 100) {
          throw new Error("Nome deve ter no máximo 100 caracteres");
        }
        return true;
      })
      .trim(),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limite deve ser um número entre 1 e 50"),
  ];

  /**
   * Validação para busca por unidade
   */
  private validateSearchByUnidade = [
    query("unidade")
      .custom((value) => {
        if (!value || value.trim() === "") {
          throw new Error("Unidade é obrigatória para busca");
        }
        if (value.length > 20) {
          throw new Error("Unidade deve ter no máximo 20 caracteres");
        }
        return true;
      })
      .trim(),
  ];

  /**
   * Validação para limite
   */
  private validateLimit = [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limite deve ser um número entre 1 e 50"),
  ];

  /**
   * Busca todos os items
   */
  public async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.service.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca item por ID
   */
  public async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID é obrigatório",
          code: "MISSING_ID",
        });
        return;
      }

      const item = await this.service.findById(id);

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca todos os items com relacionamentos
   */
  public async findAllWithRelations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.itemService.findAllWithRelations(
        page,
        limit,
        filters
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca item por ID com relacionamentos
   */
  public async findByIdWithRelations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const item = await this.itemService.findByIdWithRelations(id);

      this.successResponse(res, item);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca items por nome
   */
  public async findByNome(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const { nome } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      const items = await this.itemService.findByNome(nome as string, limit);

      this.successResponse(res, items);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca items ativos para seleção
   */
  public async findActiveForSelection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const items = await this.itemService.findActiveForSelection();
      this.successResponse(res, items);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca items por unidade
   */
  public async findByUnidade(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const { unidade } = req.query;
      const items = await this.itemService.findByUnidade(unidade as string);

      this.successResponse(res, items);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca items mais utilizados
   */
  public async findMostUsed(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const items = await this.itemService.findMostUsed(limit);

      this.successResponse(res, items);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca unidades disponíveis
   */
  public async findDistinctUnidades(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const unidades = await this.itemService.findDistinctUnidades();
      this.successResponse(res, unidades);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca estatísticas de uso do item
   */
  public async getItemStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const stats = await this.itemService.getItemStats(id);

      this.successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria um novo item
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const userId = (req as AuthenticatedRequest).user?.id;
      const data = { ...req.body, criadoPor: userId };
      const item = await this.service.create(data);

      res.status(201).json({
        success: true,
        data: item,
        message: "Item criado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza um item
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id;
      const data = { ...req.body, atualizadoPor: userId };
      const item = await this.service.update(id, data);

      res.json({
        success: true,
        data: item,
        message: "Item atualizado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exclui um item (soft delete)
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      await this.service.delete(id);

      res.json({
        success: true,
        message: "Item excluído com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Constrói filtros a partir dos query parameters
   */
  protected buildFilters(query: any): any {
    const filters: any = {};

    if (query.ativo !== undefined) {
      filters.ativo = query.ativo === "true";
    }

    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { unidade: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.nome) {
      filters.nome = {
        contains: query.nome,
        mode: "insensitive"
      };
    }

    if (query.unidade) {
      filters.unidade = {
        equals: query.unidade,
        mode: "insensitive"
      };
    }

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

  /**
   * Retorna as validações para uso nas rotas
   */
  public getValidations() {
    return {
      validateCreate: this.validateCreate,
      validateUpdate: this.validateUpdate,
      validateSearch: this.validateSearch,
      validateId: this.validateId,
      validateSearchByName: this.validateSearchByName,
      validateSearchByUnidade: this.validateSearchByUnidade,
      validateLimit: this.validateLimit,
    };
  }
}
