import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { ItemService } from "../services/ItemService";
import { CreateItemDTO, UpdateItemDTO } from "../models/DTOs";
import { AuthenticatedRequest } from "../models/Auth";
import { asyncHandler } from "../middleware/errorHandler";
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
    param("id").isUUID().withMessage("ID deve ser um UUID válido"),
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
      .isLength({ max: 100 })
      .withMessage("Nome de busca deve ter no máximo 100 caracteres")
      .trim(),
    query("unidade")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Unidade de busca deve ter no máximo 20 caracteres")
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
    param("id").isUUID().withMessage("ID deve ser um UUID válido"),
  ];

  /**
   * Validação para busca por nome
   */
  private validateSearchByName = [
    query("nome")
      .notEmpty()
      .withMessage("Nome é obrigatório para busca")
      .isLength({ max: 100 })
      .withMessage("Nome deve ter no máximo 100 caracteres")
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
      .notEmpty()
      .withMessage("Unidade é obrigatória para busca")
      .isLength({ max: 20 })
      .withMessage("Unidade deve ter no máximo 20 caracteres")
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
  public findAll = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.itemService.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    }
  );

  /**
   * Busca item por ID
   */
  public findById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const item = await this.itemService.findById(id);

      res.json({
        success: true,
        data: item,
      });
    }
  );

  /**
   * Busca todos os items com relacionamentos
   */
  public findAllWithRelations = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.itemService.findAllWithRelations(
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
   * Busca item por ID com relacionamentos
   */
  public findByIdWithRelations = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const item = await this.itemService.findByIdWithRelations(id);

      res.json({
        success: true,
        data: item,
      });
    }
  );

  /**
   * Busca items por nome
   */
  public findByNome = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { nome } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      const items = await this.itemService.findByNome(nome as string, limit);

      res.json({
        success: true,
        data: items,
      });
    }
  );

  /**
   * Busca items ativos para seleção
   */
  public findActiveForSelection = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const items = await this.itemService.findActiveForSelection();

      res.json({
        success: true,
        data: items,
      });
    }
  );

  /**
   * Busca items por unidade
   */
  public findByUnidade = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { unidade } = req.query;
      const items = await this.itemService.findByUnidade(unidade as string);

      res.json({
        success: true,
        data: items,
      });
    }
  );

  /**
   * Busca items mais utilizados
   */
  public findMostUsed = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const items = await this.itemService.findMostUsed(limit);

      res.json({
        success: true,
        data: items,
      });
    }
  );

  /**
   * Busca unidades disponíveis
   */
  public findDistinctUnidades = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const unidades = await this.itemService.findDistinctUnidades();

      res.json({
        success: true,
        data: unidades,
      });
    }
  );

  /**
   * Busca estatísticas de uso do item
   */
  public getItemStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const stats = await this.itemService.getItemStats(id);

      res.json({
        success: true,
        data: stats,
      });
    }
  );

  /**
   * Reativa um item
   */
  public reactivate = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const item = await this.itemService.reactivate(id, req.user!.id);

      res.json({
        success: true,
        message: "Item reativado com sucesso",
        data: item,
      });
    }
  );

  /**
   * Cria um novo item
   */
  public create = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const itemData: CreateItemDTO = req.body;
      const item = await this.itemService.create(itemData, req.user!.id);

      res.status(201).json({
        success: true,
        message: "Item criado com sucesso",
        data: item,
      });
    }
  );

  /**
   * Atualiza um item
   */
  public update = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const itemData: UpdateItemDTO = req.body;
      const item = await this.itemService.update(id, itemData, req.user!.id);

      res.json({
        success: true,
        message: "Item atualizado com sucesso",
        data: item,
      });
    }
  );

  /**
   * Exclui um item (soft delete)
   */
  public delete = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      await this.itemService.delete(id, req.user!.id);

      res.json({
        success: true,
        message: "Item excluído com sucesso",
      });
    }
  );

  /**
   * Constrói filtros a partir dos query parameters
   */
  private buildFilters(query: any): any {
    const filters: any = {};

    if (query.nome) {
      filters.nome = query.nome;
    }

    if (query.unidade) {
      filters.unidade = query.unidade;
    }

    if (query.ativo !== undefined) {
      filters.ativo = query.ativo === "true";
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
